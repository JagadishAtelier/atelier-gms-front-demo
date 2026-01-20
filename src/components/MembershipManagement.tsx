// src/pages/membership/MembershipManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import memberService from '../service/memberService.js';
import uploadService from '../service/uploadService.js';
import membermembershipService from '../service/membermembershipService.js';
import membershipService from '../service/membershipService.js';
import remainderemailService from '../service/remainderemailService.js'; // <-- added
import membermeasurementService from '../service/membermeasurementService.js'; // <-- NEW import
import attendanceService from '../service/attendanceService.js'; // <-- NEW import

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  member_no?: string;
  planType?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'expired' | 'pending';
  amount?: number;
  photo?: string;
  address?: string;
  emergencyContact?: string;
  joinDate?: string;
  lastPayment?: string;
  nextBilling?: string;
  notes?: string;
  is_active?: boolean;
  created_by_name?: string;
  createdAt?: string;
  workout_batch?: string;
  gender?: 'Male' | 'Female';
  dob?: string;
  age?: number;
  total_pending_amount?: number;
  next_payment_date?: string;
}

/* ---------- device hook: mobile / tablet / desktop ---------- */
function useDevice() {
  const isBrowser = typeof window !== 'undefined';
  const [width, setWidth] = useState<number>(isBrowser ? window.innerWidth : 1024);

  useEffect(() => {
    if (!isBrowser) return;
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [isBrowser]);

  const isMobile = width <= 640; // phones
  const isTablet = width > 640 && width < 1024; // tablets
  const isDesktop = width >= 1024;

  return { width, isMobile, isTablet, isDesktop };
}

export function MembershipManagement() {
  // device sizing
  const { isMobile, isTablet, isDesktop } = useDevice();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState<any>({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    amount: '',
    photo: '',
    batch: '',
    joinDate: '',
    gender: '',
    dob: '',
    notes: '',
    address: '',
    height: '',
    weight: '',
    measurementDate: '',
  });

  // profile / billing states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<Member | null>(null);

  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingMember, setBillingMember] = useState<Member | null>(null);

  // data/loaders
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0); // <-- NEW: Total count from backend
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);


  // member-membership lists for billing panel
  const [memberMemberships, setMemberMemberships] = useState<any[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [billingHasActive, setBillingHasActive] = useState(false);
  const [billingActiveItems, setBillingActiveItems] = useState<any[]>([]);

  // membership plans
  const [membershipOptions, setMembershipOptions] = useState<any[]>([]);
  const [membershipOptionsLoading, setMembershipOptionsLoading] = useState(false);

  // assign dialog states
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignMember, setAssignMember] = useState<Member | null>(null);
  const [selectedMembershipId, setSelectedMembershipId] = useState('');
  const [assignStart, setAssignStart] = useState(''); // yyyy-mm-dd
  const [assignEnd, setAssignEnd] = useState(''); // yyyy-mm-dd
  const [assignPaymentStatus, setAssignPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [assignStatus, setAssignStatus] = useState<'active' | 'expired' | 'cancelled'>('active');
  const [assignLoading, setAssignLoading] = useState(false);
  const [activeMembershipInfo, setActiveMembershipInfo] = useState<any | null>(null);

  // NEW assign-related fields requested by user:
  // membership_name derived from selectedMembershipId
  const [assignMembershipName, setAssignMembershipName] = useState<string>('');
  // payment_type enum
  const [assignPaymentType, setAssignPaymentType] = useState<'cash' | 'card' | 'online' | 'upi'>('cash');
  // amount_paid input (string to allow empty/partial)
  const [assignAmountPaid, setAssignAmountPaid] = useState<string>('0');
  // pending amount auto-calculated
  const [assignPendingAmount, setAssignPendingAmount] = useState<number | null>(null);

  // Reminder loading state (billing-only)
  const [sendingMemberReminder, setSendingMemberReminder] = useState<string | null>(null);

  // --- Attendance states ---
  const [todayAttendanceMap, setTodayAttendanceMap] = useState<Record<string, any>>({});
  const [attendanceProcessing, setAttendanceProcessing] = useState<Record<string, boolean>>({});

  // --- Bulk upload states (NEW) ---
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: any[]; failed: any[] } | null>(null);

  // --- ref for bulk input (fixes button not opening file picker) ---
  const bulkInputRef = useRef<HTMLInputElement | null>(null);

  // --- Payment/pending related states (NEW) ---
  const [pendingMap, setPendingMap] = useState<Record<string, any>>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMember, setPaymentMember] = useState<Member | null>(null);
  const [paymentSelectedMembershipId, setPaymentSelectedMembershipId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>(''); // amount to pay (incremental)
  const [paymentLoading, setPaymentLoading] = useState(false);

  // --- Next payment map (new) ---
  const [nextPaymentMap, setNextPaymentMap] = useState<Record<string, string | null>>({});
  const [nextPaymentLoading, setNextPaymentLoading] = useState<Record<string, boolean>>({});

  // --- Helpers to normalize various response shapes ---
  const extractListFromResponse = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.rows)) return res.rows;
    if (Array.isArray(res.data?.rows)) return res.data.rows;
    return [];
  };

  // --- Currency helper: format INR ---
  const formatCurrencyINR = (val: number | string | undefined | null) => {
    if (val === undefined || val === null || val === '') return '—';
    const num = Number(val);
    if (isNaN(num)) return '—';
    return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
  };

  // --- Age helper: calculate years from DOB (returns integer years or undefined) ---
  const calculateAge = (dobIsoOrDate: string | Date | undefined | null): number | undefined => {
    if (!dobIsoOrDate) return undefined;
    const d = typeof dobIsoOrDate === 'string' ? new Date(dobIsoOrDate) : dobIsoOrDate;
    if (!d || isNaN(d.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age >= 0 ? age : undefined;
  };

  // map backend member -> UI Member
  const mapBackendToMember = (item: any): Member => {
    const amount = item.membership?.price ? Number(item.membership.price) : (item.amount ? Number(item.amount) : 0);
    const startDate = item.start_date || item.startDate || item.join_date || item.joinDate || '';
    const endDate = item.end_date || item.endDate || '';
    const isActive = typeof item.is_active !== 'undefined' ? item.is_active : (item.status === 'active');

    const status: Member['status'] = isActive ? 'active' : (item.status as Member['status'] || 'expired');

    const dobRaw = item.dob || item.DOB || item.date_of_birth || item.dateOfBirth || null;
    const dobIso = dobRaw ? (typeof dobRaw === 'string' ? dobRaw : (dobRaw instanceof Date ? dobRaw.toISOString() : String(dobRaw))) : undefined;
    const age = dobIso ? calculateAge(dobIso) : undefined;

    return {
      id: item.id,
      name: item.name || item.full_name || 'Unknown',
      email: item.email || '',
      phone: item.phone || '',
      member_no: item.member_no || item.memberNo || item.member_number || undefined,
      startDate,
      endDate,
      status,
      amount,
      photo: item.image_url || item.photo || undefined,
      address: item.address || undefined,
      emergencyContact: item.emergency_contact || item.emergencyContact || undefined,
      joinDate: item.join_date || item.joinDate || undefined,
      lastPayment: item.lastPayment || item.last_payment || undefined,
      nextBilling: item.nextBilling || item.next_billing || undefined,
      notes: item.notes || item.description || undefined,
      is_active: isActive,
      created_by_name: item.created_by_name || item.createdByName || undefined,
      createdAt: item.createdAt || item.created_at || undefined,
      workout_batch: item.workout_batch || item.workoutBatch || undefined,
      gender: item.gender || undefined,
      dob: dobIso,

      age,
      total_pending_amount: item.total_pending_amount !== undefined ? Number(item.total_pending_amount) : undefined,
      next_payment_date: item.next_payment_date || undefined
    };
  };

  // --- Fetch members function (updated for infinite scroll) ---
  const fetchMembers = async (pageToFetch = 1, reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
      setHasMore(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const response = await memberService.getMembers({ page: pageToFetch, limit: 50 });

      // Robustly extract total
      const totalCount = response?.data?.total ?? response?.total ?? 0;
      if (typeof totalCount === 'number') {
        setTotalMembers(totalCount);
      }

      const list = extractListFromResponse(response);
      const mapped = list.map(mapBackendToMember);

      if (list.length < 50) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setMembers((prev) => {
        if (reset) return mapped;
        // avoid duplicates based on ID
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNew = mapped.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      return mapped;
    } catch (err: any) {
      console.error('Failed to fetch members', err);
      toast.error(err?.message || 'Failed to load members');
      return [];
    } finally {
      if (reset) setLoading(false);
      else setIsFetchingMore(false);
    }
  };

  // --- Infinite Scroll Observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, isFetchingMore]);

  // --- Fetch more when page changes ---
  useEffect(() => {
    if (page > 1) {
      fetchMembers(page, false);
    }
  }, [page]);


  // --- Fetch pending amount for a single member ---
  const fetchPendingForMember = async (memberId: string, includeInactive = false) => {
    try {
      const res = await membermembershipService.getPendingAmountByMemberId(memberId, includeInactive);
      // service returns a shape like { member_id, total_pending_amount, memberships }
      const payload = res?.data || res;
      setPendingMap(prev => ({ ...prev, [memberId]: payload }));
      return payload;
    } catch (err) {
      console.warn('Failed to fetch pending for member', memberId, err);
      setPendingMap(prev => ({ ...prev, [memberId]: { member_id: memberId, total_pending_amount: 0, memberships: [] } }));
      return { member_id: memberId, total_pending_amount: 0, memberships: [] };
    }
  };

  // --- Fetch next payment date for a single member ---
  const fetchNextPaymentForMember = async (memberId: string) => {
    try {
      setNextPaymentLoading(prev => ({ ...prev, [memberId]: true }));
      const res = await membermembershipService.getNextPaymentDateByMemberId(memberId);
      const payload = res?.data || res;
      // flexibly pick possible fields
      const dateStr =
        payload?.next_payment_date ||
        payload?.nextPaymentDate ||
        payload?.next_payment ||
        payload?.nextPayment ||
        null;
      setNextPaymentMap(prev => ({ ...prev, [memberId]: dateStr }));
      return dateStr;
    } catch (err) {
      console.warn('Failed to fetch next payment for member', memberId, err);
      setNextPaymentMap(prev => ({ ...prev, [memberId]: null }));
      return null;
    } finally {
      setNextPaymentLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };



  // --- Fetch todays attendances (extracted so we can refresh after sign in/out) ---
  const fetchTodays = async () => {
    try {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date();
      to.setHours(23, 59, 59, 999);

      const res = await attendanceService.getAttendances({
        from_date: from.toISOString(),
        to_date: to.toISOString(),
        limit: 1000
      });
      const list = extractListFromResponse(res);
      const map: Record<string, any> = {};
      list.forEach((a: any) => {
        const memberId = a.member_id || a.memberId || a.member || a.member_id?.toString?.() || String(a.member_id || a.member || a.memberId || '');
        if (memberId) map[String(memberId)] = a;
      });
      setTodayAttendanceMap(map);
    } catch (err) {
      console.warn('Failed to fetch today attendances', err);
    }
  };

  // --- Load members on mount and today's attendances ---
  useEffect(() => {
    (async () => {
      await fetchMembers(1, true);
      await fetchTodays();
    })();
  }, []);


  // --- When members or filters/search change, fetch pending for visible members and next payments ---
  // OPTIMIZATION: Removed expensive N+1 calls. Backend now provides next_payment_date and total_pending_amount.
  // We only rely on map if we want to force refresh or specific details.
  // The 'pendingMap' and 'nextPaymentMap' will now be populated lazily or ignored for list view.


  // --- Load membership plans ---
  useEffect(() => {
    const fetchMemberships = async () => {
      setMembershipOptionsLoading(true);
      try {
        const res = await membershipService.getMemberships({ page: 1, limit: 200 });
        const list = extractListFromResponse(res);
        setMembershipOptions(list);
      } catch (err: any) {
        console.error('Failed to fetch membership options', err);
      } finally {
        setMembershipOptionsLoading(false);
      }
    };
    fetchMemberships();
  }, []);

  // --- Image upload ---
  const uploadAndSetPhoto = async (file: File | null) => {
    if (!file) return;
    try {
      setImageUploading(true);
      const url = await uploadService.handleImageUpload(file);
      setNewMember((prev: any) => ({ ...prev, photo: url }));
      toast.success('Image uploaded');
    } catch (err: any) {
      console.error('Image upload failed', err);
      toast.error(err?.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  // --- Attendance actions (Sign In / Sign Out) ---
  const setAttendanceProcessingFlag = (memberId: string, val: boolean) => {
    setAttendanceProcessing(prev => ({ ...prev, [memberId]: val }));
  };

  const handleSignIn = async (member: Member) => {
    if (!member || !member.id) return;
    setAttendanceProcessingFlag(member.id, true);
    try {
      const payload = { member_id: member.id, sign_in: new Date().toISOString() };
      const res = await attendanceService.signIn(payload);
      const memberKey = String(member.id);
      setTodayAttendanceMap(prev => ({ ...prev, [memberKey]: res || payload }));
      toast.success('Signed in');
      // await fetchMembers(1, true); // Don't reload all, just today's attendance needs refresh

      await fetchTodays();
    } catch (err: any) {
      console.error('Sign-in failed', err);
      toast.error(err?.message || 'Failed to sign in');
    } finally {
      setAttendanceProcessingFlag(member.id, false);
    }
  };

  const handleSignOut = async (member: Member) => {
    if (!member || !member.id) return;
    setAttendanceProcessingFlag(member.id, true);
    try {
      const payload = { member_id: member.id, sign_out: new Date().toISOString() };
      const res = await attendanceService.signOut(payload);
      const memberKey = String(member.id);
      setTodayAttendanceMap(prev => {
        const prevRec = prev[memberKey] || {};
        const updated = res && typeof res === 'object' ? { ...prevRec, ...res } : { ...prevRec, sign_out: payload.sign_out };
        return { ...prev, [memberKey]: updated };
      });
      toast.success('Signed out');
      // await fetchMembers(1, true);

      await fetchTodays();
    } catch (err: any) {
      console.error('Sign-out failed', err);
      toast.error(err?.message || 'Failed to sign out');
    } finally {
      setAttendanceProcessingFlag(member.id, false);
    }
  };

  // --- Bulk Upload handler (NEW) ---
  const handleBulkUpload = async (file: File | null) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setBulkUploading(true);
    setBulkResult(null);

    try {
      const res = await memberService.bulkUpload(file);
      const success = res?.success || [];
      const failed = res?.failed || [];
      setBulkResult({ success, failed });
      toast.success(`Bulk upload finished succeeded`);
      await fetchMembers(1, true);

      await fetchTodays();
    } catch (err: any) {
      console.error('Bulk upload failed', err);
      toast.error(err?.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  // file input change wrapper
  const onBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    await handleBulkUpload(file);
    e.currentTarget.value = '';
  };

  // download failed rows as CSV
  const downloadFailedCSV = (failedRows: any[]) => {
    if (!Array.isArray(failedRows) || failedRows.length === 0) {
      toast.error('No failed rows to download');
      return;
    }

    const headersSet = new Set<string>();
    failedRows.forEach(r => {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach(k => headersSet.add(k));
      }
    });
    const headers = Array.from(headersSet);

    const csvLines = [];
    csvLines.push(headers.join(','));
    failedRows.forEach((row) => {
      const line = headers.map(h => {
        let cell = row[h];
        if (cell === null || typeof cell === 'undefined') return '';
        if (typeof cell === 'object') cell = JSON.stringify(cell);
        const cellStr = String(cell).replace(/"/g, '""');
        return (/,|\n/.test(cellStr) ? `"${cellStr}"` : cellStr);
      }).join(',');
      csvLines.push(line);
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-upload-failed-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Add member ---
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone || undefined,
        gender: newMember.gender || undefined,
        dob: newMember.dob ? new Date(newMember.dob).toISOString() : undefined,
        join_date: newMember.joinDate ? new Date(newMember.joinDate).toISOString() : undefined,
        start_date: newMember.startDate ? new Date(newMember.startDate).toISOString() : undefined,
        workout_batch: newMember.batch || undefined,
        image_url: newMember.photo || undefined,
        is_active: typeof newMember.is_active !== 'undefined' ? newMember.is_active : true,
        notes: newMember.notes || undefined,
        address: newMember.address || undefined
      };

      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const createdRes = await memberService.createMember(payload);
      const createdItem = (createdRes && (createdRes.data || createdRes)) || createdRes;
      const mapped = mapBackendToMember(createdItem);
      setMembers((prev) => [...prev, mapped]);

      const hasMeasurement = (newMember.height && newMember.height !== '') || (newMember.weight && newMember.weight !== '');
      if (hasMeasurement) {
        try {
          const measurementPayload: any = {
            member_id: createdItem.id,
            height: newMember.height ? Number(newMember.height) : undefined,
            weight: newMember.weight ? Number(newMember.weight) : undefined,
            measurement_date: newMember.measurementDate && newMember.measurementDate !== ''
              ? new Date(newMember.measurementDate).toISOString()
              : new Date().toISOString()
          };
          Object.keys(measurementPayload).forEach(k => measurementPayload[k] === undefined && delete measurementPayload[k]);

          await membermeasurementService.createMemberMeasurement(measurementPayload);
          toast.success('Member added and initial measurement saved');
        } catch (mErr: any) {
          console.error('Failed to save initial measurement', mErr);
          toast.warning('Member added but failed to save measurement');
        }
      } else {
        toast.success('Member added');
      }

      setIsAddMemberOpen(false);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        startDate: '',
        amount: '',
        photo: '',
        batch: '',
        joinDate: '',
        gender: '',
        dob: '',
        notes: '',
        address: '',
        height: '',
        weight: '',
        measurementDate: '',
      });
    } catch (err: any) {
      console.error('Add member error', err);
      toast.error(err?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  // --- Profile edit handlers ---
  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    setEditedMember({ ...member });
    setIsEditing(false);
    setIsProfileOpen(true);
  };

  const handleEditProfile = () => setIsEditing(true);

  const handleCancelEdit = () => {
    if (selectedMember) {
      setEditedMember({ ...selectedMember });
      setIsEditing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedMember) return;
    try {
      setLoading(true);
      const payload: any = {
        name: editedMember.name,
        email: editedMember.email,
        phone: editedMember.phone || undefined,
        start_date: editedMember.startDate ? new Date(editedMember.startDate).toISOString() : undefined,
        join_date: editedMember.joinDate ? new Date(editedMember.joinDate).toISOString() : undefined,
        workout_batch: editedMember.workout_batch || editedMember['batch'] || undefined,
        image_url: editedMember.photo || undefined,
        is_active: typeof editedMember.is_active !== 'undefined' ? editedMember.is_active : undefined,
        notes: editedMember.notes || undefined,
        gender: editedMember.gender || undefined,
        dob: editedMember.dob ? new Date(editedMember.dob).toISOString() : undefined
      };

      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await memberService.updateMember(editedMember.id, payload);
      const newAge = editedMember.dob ? calculateAge(editedMember.dob) : editedMember.age;
      setMembers((prev) => prev.map((m) => (m.id === editedMember.id ? { ...m, ...editedMember, age: newAge } : m)));
      setSelectedMember(editedMember);
      setIsEditing(false);
      toast.success('Member updated');
    } catch (err: any) {
      console.error('Update member failed', err);
      toast.error(err?.message || 'Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  // --- Delete / Restore member ---
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await memberService.deleteMember(id);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: false, status: 'expired' } : m)));
      toast.success('Member deactivated');
      // refresh pending map for this member
      setPendingMap(prev => ({ ...prev, [id]: { member_id: id, total_pending_amount: 0, memberships: [] } }));
    } catch (err: any) {
      console.error('Delete member failed', err);
      toast.error(err?.message || 'Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setLoading(true);
      await memberService.restoreMember(id);
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, is_active: true, status: 'active' } : m)));
      toast.success('Member restored');
      await fetchPendingForMember(id);
      await fetchNextPaymentForMember(id);
    } catch (err: any) {
      console.error('Restore failed', err);
      toast.error(err?.message || 'Failed to restore member');
    } finally {
      setLoading(false);
    }
  };

  // --- Date helpers ---
  const formatDateYYYYMMDD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatPretty = (isoOrDate: string | Date | null) => {
    if (!isoOrDate) return 'N/A';
    const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString();
  };

  const addDays = (d: Date, days: number) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  const addMonthsToDate = (d: Date, months: number) => {
    const copy = new Date(d);
    const m = copy.getMonth();
    copy.setMonth(m + months);
    if (copy.getDate() !== d.getDate()) {
      copy.setDate(0);
    }
    return copy;
  };

  // --- Fetch latest membership for assign dialog (prefers active membership) ---
  const fetchLatestMembershipForMember = async (memberId: string) => {
    try {
      const activeRes = await membermembershipService.getActiveMembershipsByMemberId(memberId);
      const activeList = extractListFromResponse(activeRes);
      if (Array.isArray(activeList) && activeList.length > 0) {
        const withParsed = activeList.map((it: any) => ({
          ...it,
          parsedEnd: it.end_date ? new Date(it.end_date) : it.endDate ? new Date(it.endDate) : null
        })).filter((it: any) => it.parsedEnd !== null);
        if (withParsed.length > 0) {
          withParsed.sort((a: any, b: any) => b.parsedEnd.getTime() - a.parsedEnd.getTime());
          return { latest: withParsed[0], source: 'active' };
        }
      }

      const allRes = await membermembershipService.getAllMembershipsByMemberId(memberId);
      const allList = extractListFromResponse(allRes);
      if (!Array.isArray(allList) || allList.length === 0) return { latest: null, source: 'none' };

      const withParsedAll = allList.map((it: any) => ({
        ...it,
        parsedEnd: it.end_date ? new Date(it.end_date) : it.endDate ? new Date(it.endDate) : null
      })).filter((it: any) => it.parsedEnd !== null);
      if (withParsedAll.length === 0) return { latest: null, source: 'none' };

      withParsedAll.sort((a: any, b: any) => b.parsedEnd.getTime() - a.parsedEnd.getTime());
      return { latest: withParsedAll[0], source: 'all' };
    } catch (err) {
      console.warn('Failed to fetch latest membership for member', err);
      return { latest: null, source: 'error' };
    }
  };

  // --- Open assign dialog with smart defaults ---
  const openAssignDialog = async (member: Member) => {
    setAssignMember(member);
    setSelectedMembershipId('');
    setAssignPaymentStatus('paid');
    setAssignStatus('active');
    setActiveMembershipInfo(null);

    // reset new assign fields
    setAssignMembershipName('');
    setAssignPaymentType('cash');
    setAssignAmountPaid('0');
    setAssignPendingAmount(null);

    const today = new Date();
    let computedStart = today;

    try {
      const { latest, source } = await fetchLatestMembershipForMember(member.id);
      if (latest && latest.parsedEnd) {
        const lastEndDate: Date = latest.parsedEnd;
        if (lastEndDate >= today) {
          computedStart = addDays(lastEndDate, 1);
          setActiveMembershipInfo({
            id: latest.id,
            membership_name: latest.Membership?.name || latest.membership?.name || latest.membership_name || '—',
            end_date: latest.end_date || latest.endDate || null,
            source
          });
        } else {
          computedStart = today;
        }
      }
    } catch (err) {
      computedStart = today;
    }

    setAssignStart(formatDateYYYYMMDD(computedStart));
    const defaultEnd = addMonthsToDate(computedStart, 1);
    setAssignEnd(formatDateYYYYMMDD(defaultEnd));
    setIsAssignOpen(true);
  };

  // --- When selectedMembershipId changes, update membership_name and pending calculation ---
  useEffect(() => {
    if (!selectedMembershipId) {
      setAssignMembershipName('');
      setAssignPendingAmount(null);
      return;
    }
    const selectedPlan = membershipOptions.find((m: any) => String(m.id) === String(selectedMembershipId));
    const planName = selectedPlan?.name || selectedPlan?.membership_name || '';
    setAssignMembershipName(planName);

    const planPrice = Number(selectedPlan?.price ?? selectedPlan?.amount ?? selectedPlan?.membership_price ?? 0) || 0;
    const paid = Number(assignAmountPaid || 0) || 0;
    const pending = Math.max(0, planPrice - paid);
    setAssignPendingAmount(pending);

    // auto choose payment_status: if fully paid then 'paid' else 'unpaid'
    setAssignPaymentStatus(paid >= planPrice ? 'paid' : 'unpaid');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembershipId, membershipOptions]);

  // --- When assignAmountPaid changes, recalc pending based on selected plan ---
  useEffect(() => {
    const selectedPlan = membershipOptions.find((m: any) => String(m.id) === String(selectedMembershipId));
    const planPrice = Number(selectedPlan?.price ?? selectedPlan?.amount ?? selectedPlan?.membership_price ?? 0) || 0;
    const paid = Number(assignAmountPaid || 0) || 0;
    const pending = Math.max(0, planPrice - paid);
    setAssignPendingAmount(pending);
    setAssignPaymentStatus(paid >= planPrice ? 'paid' : 'unpaid');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignAmountPaid]);

  // --- Auto-calc assignEnd based on selected plan's duration_months ---
  useEffect(() => {
    if (!assignStart) return;

    const start = new Date(assignStart + 'T00:00:00');
    if (!isNaN(start.getTime())) {
      const selectedPlan = membershipOptions.find((m: any) => String(m.id) === String(selectedMembershipId));
      let months = 1;
      if (selectedPlan) {
        months =
          (selectedPlan.duration_months && Number(selectedPlan.duration_months)) ||
          (selectedPlan.duration && Number(selectedPlan.duration)) ||
          (selectedPlan.months && Number(selectedPlan.months)) ||
          (selectedPlan.durationMonths && Number(selectedPlan.durationMonths)) ||
          1;
        if (isNaN(months) || months <= 0) months = 1;
      } else {
        months = 1;
      }

      const calcEnd = addMonthsToDate(start, months);
      setAssignEnd(formatDateYYYYMMDD(calcEnd));
    }
  }, [selectedMembershipId, assignStart, membershipOptions]);

  // --- Submit assign ---
  const handleAssignSubmit = async () => {
    if (!assignMember) {
      toast.error('No member selected');
      return;
    }
    if (!selectedMembershipId) {
      toast.error('Please select a membership plan');
      return;
    }
    if (!assignStart || !assignEnd) {
      toast.error('Please provide start and end dates');
      return;
    }

    const startDateObj = new Date(assignStart + 'T00:00:00');
    const endDateObj = new Date(assignEnd + 'T00:00:00');
    if (startDateObj > endDateObj) {
      toast.error('Start date must be before end date');
      return;
    }

    try {
      setAssignLoading(true);

      // determine plan price for pending calculations
      const selectedPlan = membershipOptions.find((m: any) => String(m.id) === String(selectedMembershipId));
      const planPrice = Number(selectedPlan?.price ?? selectedPlan?.amount ?? selectedPlan?.membership_price ?? 0) || 0;
      const paid = Number(assignAmountPaid || 0) || 0;
      const pending = Math.max(0, planPrice - paid);

      // compute payment_status automatically (also keep user's assignPaymentStatus fallback)
      const computedPaymentStatus: 'paid' | 'unpaid' = paid >= planPrice ? 'paid' : 'unpaid';

      // build payload including new fields
      const payload: any = {
        member_id: assignMember.id,
        membership_id: selectedMembershipId,
        membership_name: assignMembershipName || (selectedPlan?.name ?? ''),
        start_date: new Date(assignStart).toISOString(),
        end_date: new Date(assignEnd).toISOString(),
        payment_status: computedPaymentStatus,
        status: assignStatus,
        payment_type: assignPaymentType,
        amount_paid: paid,
        pending_amount: pending
      };

      // strip undefined keys (if any)
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await membermembershipService.createMemberMembership(payload);
      toast.success('Membership assigned successfully');

      // reload membership list for billing panel if open for this member
      if (assignMember && billingMember && assignMember.id === billingMember.id) {
        try {
          setMembershipLoading(true);
          const listRes = await membermembershipService.getAllMembershipsByMemberId(billingMember.id);
          const list = extractListFromResponse(listRes);
          const normalized = list.map((itm: any) => ({
            id: itm.id,
            membership_name: itm.Membership?.name || itm.membership?.name || itm.membership_name || (itm.membership_id || ''),
            start_date: itm.start_date || itm.startDate || null,
            end_date: itm.end_date || itm.endDate || null,
            payment_status: itm.payment_status || itm.paymentStatus || null,
            status: itm.status || null,
            raw: itm
          }));
          setMemberMemberships(normalized);

          const actRes = await membermembershipService.getActiveMembershipsByMemberId(billingMember.id);
          const actList = extractListFromResponse(actRes);
          setBillingHasActive(Array.isArray(actList) && actList.length > 0);
          setBillingActiveItems(actList || []);
        } catch (err) {
          console.error('Reload memberships failed', err);
        } finally {
          setMembershipLoading(false);
        }
      }

      setIsAssignOpen(false);
    } catch (err: any) {
      console.error('Assign membership failed', err);
      toast.error(err?.message || 'Failed to assign membership');
    } finally {
      setAssignLoading(false);
    }
  };

  // --- Billing panel: load all memberships + check actives ---
  const handleViewBilling = async (member: Member) => {
    setBillingMember(member);
    setIsBillingOpen(true);

    try {
      setMembershipLoading(true);
      setMemberMemberships([]);
      setBillingHasActive(false);
      setBillingActiveItems([]);

      const res = await membermembershipService.getAllMembershipsByMemberId(member.id);
      const list = extractListFromResponse(res);

      const normalized = list.map((itm: any) => ({
        id: itm.id,
        membership_name: itm.Membership?.name || itm.membership?.name || itm.membership_name || (itm.membership_id || ''),
        start_date: itm.start_date || itm.startDate || null,
        end_date: itm.end_date || itm.endDate || null,
        payment_status: itm.payment_status || itm.paymentStatus || null,
        status: itm.status || null,
        createdAt: itm.createdAt || itm.created_at || itm.createdAt || null,
        Membership: itm.Membership || itm.membership || null,
        amount_paid: itm.amount_paid || itm.amountPaid || null,
        raw: itm
      }));
      setMemberMemberships(normalized);

      const activeList = normalized.filter((n) => (n.raw?.status === 'active' || n.raw?.is_active === true));

      const parseDate = (s: string | null) => (s ? new Date(s) : null);
      const withParsedEnd = activeList
        .map((a) => ({ ...a, parsedEnd: parseDate(a.end_date) }))
        .filter((a) => a.parsedEnd instanceof Date && !isNaN(a.parsedEnd.getTime()));

      let currentPlanName: string | null = null;
      if (withParsedEnd.length > 0) {
        withParsedEnd.sort((a, b) => b.parsedEnd!.getTime() - a.parsedEnd!.getTime());
        currentPlanName = withParsedEnd[0].Membership?.name || withParsedEnd[0].membership_name || null;
      } else {
        const mostRecent = normalized
          .slice()
          .filter(n => n.createdAt)
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
        currentPlanName = mostRecent?.Membership?.name || mostRecent?.membership_name || null;
      }

      const paidList = normalized
        .filter((n) => (n.payment_status === 'paid' || n.raw?.payment_status === 'paid'))
        .filter(n => n.createdAt);
      let lastPaymentDate: string | null = null;
      if (paidList.length > 0) {
        paidList.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        lastPaymentDate = paidList[0].createdAt;
      } else {
        lastPaymentDate = null;
      }

      const latestCreated = normalized
        .slice()
        .filter(n => n.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
      let amountVal: number | undefined = undefined;

      if (latestCreated?.Membership?.price) {
        const p = Number(latestCreated.Membership.price);
        amountVal = isNaN(p) ? undefined : p;
      } else if (latestCreated?.raw?.amount_paid) {
        const p = Number(latestCreated.raw.amount_paid);
        amountVal = isNaN(p) ? undefined : p;
      } else if (latestCreated?.raw?.amount) {
        const p = Number(latestCreated.raw.amount);
        amountVal = isNaN(p) ? undefined : p;
      } else {
        amountVal = member.amount;
      }

      const allParsedEnds = normalized
        .map(n => parseDate(n.end_date))
        .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()));
      let nextBillingDateISO: string | null = null;
      if (allParsedEnds.length > 0) {
        const maxEnd = allParsedEnds.reduce((max, cur) => (cur.getTime() > max.getTime() ? cur : max), allParsedEnds[0]);
        const nextBill = addDays(maxEnd, 1);
        nextBillingDateISO = nextBill.toISOString();
      }

      setBillingHasActive(activeList.length > 0);
      setBillingActiveItems(activeList);

      setBillingMember((prev) => (({
        ...(prev || member),
        planType: currentPlanName || (prev?.planType ?? ''),
        amount: typeof amountVal !== 'undefined' ? amountVal : (prev?.amount ?? undefined),
        lastPayment: lastPaymentDate || prev?.lastPayment || undefined,
        nextBilling: nextBillingDateISO || prev?.nextBilling || undefined
      })));
    } catch (err: any) {
      console.error('Failed to load member memberships', err);
      toast.error(err?.message || 'Failed to load memberships for this member');
      setMemberMemberships([]);
      setBillingHasActive(false);
      setBillingActiveItems([]);
    } finally {
      setMembershipLoading(false);
    }
  };

  // --- Billing-only: Send payment reminder by member_id (shows next payment date & current membership) ---
  const handleSendMemberNextPaymentReminder = async (memberId: string) => {
    if (!memberId) {
      toast.error('Member id missing');
      return;
    }
    try {
      setSendingMemberReminder(memberId);
      const res = await remainderemailService.sendNextPaymentReminder(memberId);
      toast.success(res?.message || 'Payment reminder sent');

      if (billingMember && billingMember.id === memberId) {
        await handleViewBilling(billingMember);
      }
    } catch (err: any) {
      console.error('Failed to send next payment reminder', err);
      toast.error(err?.message || err?.data?.message || 'Failed to send reminder');
    } finally {
      setSendingMemberReminder(null);
    }
  };

  const handleUpdatePayment = () => {
    console.log('Process payment for:', billingMember?.name);
    setIsBillingOpen(false);
    toast.success('Payment processed (mock)');
  };

  // --- Payment modal handlers (NEW) ---
  const openPaymentModal = async (member: Member) => {
    setPaymentMember(member);
    // Fetch detailed breakdown (memberships) on demand since list only has total
    const info = await fetchPendingForMember(member.id);

    setPaymentSelectedMembershipId(
      (info?.memberships && info.memberships.find((m: any) => m.pending_amount > 0)?.member_membership_id) ||
      (info?.memberships && info.memberships[0]?.member_membership_id) ||
      null
    );
    setPaymentAmount(''); // reset
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentMember(null);
    setPaymentSelectedMembershipId(null);
    setPaymentAmount('');
  };

  const handleSubmitPayment = async () => {
    if (!paymentMember || !paymentSelectedMembershipId) {
      toast.error('Select a membership to apply payment');
      return;
    }
    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    try {
      setPaymentLoading(true);
      // updateMemberMembership expects incremental payment in amount_paid field per backend design
      await membermembershipService.updateMemberMembership(paymentSelectedMembershipId, { amount_paid: amt });
      toast.success('Payment recorded');

      // refresh pending for this member and overall members list
      await fetchPendingForMember(paymentMember.id);
      await fetchNextPaymentForMember(paymentMember.id);
      await fetchNextPaymentForMember(paymentMember.id);
      // await fetchMembers(1, true); // Avoid full reload if not strictly needed, or reload current Member


      // if billing panel open for this member, refresh it
      if (billingMember && billingMember.id === paymentMember.id) {
        await handleViewBilling(billingMember);
      }

      closePaymentModal();
    } catch (err: any) {
      console.error('Payment update failed', err);
      toast.error(err?.message || 'Failed to process payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // search & filter
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || member.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // new payment badge (replaces original status badge cell)
  const getPaymentBadgeForMember = (member: Member) => {
    // Prefer member.total_pending_amount if available (optimized path)
    // Fallback to pendingMap if legacy or freshly fetched
    let totalPending: number | undefined = member.total_pending_amount;

    if (totalPending === undefined && pendingMap[member.id]) {
      totalPending = Number(pendingMap[member.id]?.total_pending_amount);
    }


    const smallBadgeClass = isTablet ? 'px-1 py-0.5 text-[11px]' : 'px-2 py-0.5 text-sm';
    if (typeof totalPending === 'undefined') {
      // unknown -> show original status with subdued outline to avoid layout shift
      return <Badge variant="outline" className={smallBadgeClass}>Loading</Badge>;
    }

    if (Number(totalPending) <= 0) {
      return <Badge className={`bg-neon-green/10 text-neon-green border-neon-green/20 ${smallBadgeClass}`}>Paid</Badge>;
    }

    // Pending -> show badge + action button
    return (
      <div className="flex items-center gap-2">
        <Badge className={`bg-yellow-50 text-yellow-600 border-yellow-200 ${smallBadgeClass}`}>Pending</Badge>
        <Button
          variant="ghost"
          size="sm"
          className={`text-yellow-700 hover:bg-yellow-50 ${isTablet ? 'px-2 py-1 text-sm' : ''}`}
          onClick={() => openPaymentModal(member)}
        >
          Pay
        </Button>
      </div>
    );
  };

  // getStatusBadge (kept for profile modal)
  const getStatusBadge = (status: string) => {
    const smallBadgeClass = isTablet ? 'px-1 py-0.5 text-[11px]' : 'px-2 py-0.5 text-sm';
    switch (status) {
      case 'active':
        return <Badge className={`bg-neon-green/10 text-neon-green border-neon-green/20 ${smallBadgeClass}`}>Active</Badge>;
      case 'expired':
        return <Badge variant="destructive" className={smallBadgeClass}>Expired</Badge>;
      case 'pending':
        return <Badge className={`bg-yellow-500/10 text-yellow-500 border-yellow-500/20 ${smallBadgeClass}`}>Pending</Badge>;
      default:
        return <Badge variant="outline" className={smallBadgeClass}>Unknown</Badge>;
    }
  };

  const memberCounts = {
    all: totalMembers || members.length, // use total if available
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    pending: members.filter(m => m.status === 'pending').length
  };

  // ----- responsive classes (compact tablet tuning) -----
  const pagePadding = isTablet ? 'px-3' : 'px-0';
  const headingClass = isTablet ? 'text-xl' : 'text-3xl';
  const subtitleClass = isTablet ? 'text-sm' : 'text-muted-foreground';
  const cardPadding = isTablet ? 'p-3' : 'p-6';
  const smallCardPadding = isTablet ? 'p-2' : 'p-4';
  const dialogPadding = isTablet ? 'px-3 py-2' : 'px-4 py-4';
  const smallText = isTablet ? 'text-xs' : 'text-sm';
  const tableRowPadding = isTablet ? 'py-1 px-2' : 'py-3 px-4';
  const iconClass = isTablet ? 'w-3 h-3' : 'w-4 h-4';
  const avatarSizeClass = isTablet ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const dialogMaxW = isTablet ? 'max-w-lg' : 'max-w-2xl';
  const buttonCompact = isTablet ? 'px-3 py-1 text-sm' : 'px-4 py-2';

  return (
    <div className={`space-y-6 ${pagePadding}`}>
      {/* Top area */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
        <div>
          <h1 className={`${headingClass} mb-2 font-semibold`}>Membership Management</h1>
          <p className={`${subtitleClass}`}>Manage gym members, plans, and renewals</p>
        </div>

        {/* Add member + Bulk Upload */}
        <div className="flex items-center gap-2">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button className={`bg-gradient-to-r from-neon-green to-neon-blue text-white ${isTablet ? 'px-3 py-1 text-sm' : 'px-4 py-2'}`}>
                <Plus className={`${iconClass} mr-2`} />
                <span className="hidden sm:inline">{isTablet ? 'Add Member' : 'Add New Member'}</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>

            <DialogContent className={`${dialogMaxW} w-[95vw] max-h-[90vh] overflow-y-auto mx-4 sm:mx-0`}>
              <DialogHeader className={`${dialogPadding}`}>
                <DialogTitle className={`${isTablet ? 'text-lg' : 'text-xl'}`}>Add New Member</DialogTitle>
              </DialogHeader>
              <div className={`grid gap-2 sm:gap-3 ${isTablet ? 'py-2 px-1' : 'py-3 px-1 sm:px-0'}`}>
                <div className="grid gap-2">
                  <Label htmlFor="photo" className={`${smallText}`}>Member Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={async (e: any) => {
                      const file = e.target.files?.[0] || null;
                      if (!file) return;
                      await uploadAndSetPhoto(file);
                    }}
                    className={`cursor-pointer ${isTablet ? 'text-xs' : 'text-sm'}`}
                    disabled={imageUploading}
                  />
                  {imageUploading ? <div className="text-xs text-muted-foreground">Uploading image...</div> : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label className={`${smallText}`}>Full Name</Label>
                    <Input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Email</Label>
                    <Input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Phone</Label>
                    <Input value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} />
                  </div>

                  <div>
                    <Label className={`${smallText}`}>Date of Birth</Label>
                    <Input type="date" value={newMember.dob} onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })} />
                  </div>

                  <div>
                    <Label className={`${smallText}`}>Height (cm)</Label>
                    <Input type="number" value={newMember.height} onChange={(e) => setNewMember({ ...newMember, height: e.target.value })} />
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Weight (kg)</Label>
                    <Input type="number" value={newMember.weight} onChange={(e) => setNewMember({ ...newMember, weight: e.target.value })} />
                  </div>

                  <div>
                    <Label className={`${smallText}`}>Measurement Date</Label>
                    <Input type="date" value={newMember.measurementDate} onChange={(e) => setNewMember({ ...newMember, measurementDate: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label className={`${smallText}`}>Address</Label>
                  <Textarea
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    rows={2}
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <Label className={`${smallText}`}>Start Date</Label>
                  <Input type="date" value={newMember.startDate} onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })} />
                </div>
              </div>

              <DialogFooter className={`flex flex-col sm:flex-row gap-2 sm:gap-0 ${dialogPadding}`}>
                <Button onClick={handleAddMember} className={`${isTablet ? 'w-full sm:w-auto px-3 py-1 text-sm' : 'w-full sm:w-auto px-4 py-2'} bg-gradient-to-r from-neon-green to-neon-blue text-white`} disabled={loading || imageUploading}>
                  {loading ? 'Saving...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk upload input/button */}
          <>
            <input
              ref={bulkInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onBulkFileChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="ghost"
              size="sm"
              className={`${isTablet ? 'px-2 py-1 text-sm' : ''} border`}
              disabled={bulkUploading}
              onClick={() => bulkInputRef.current?.click()}
            >
              {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
            </Button>
          </>
        </div>
      </div>

      {/* show bulk upload result summary if present */}
      {bulkResult && (
        <Card className="border-border/50">
          <CardContent className={cardPadding}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Bulk Upload Result</div>
                <div className="text-sm text-muted-foreground">
                  Success: {bulkResult.success.length} • Failed: {bulkResult.failed.length}
                </div>
              </div>
              <div className="flex gap-2">
                {bulkResult.failed.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFailedCSV(bulkResult.failed)}
                    className={`${isTablet ? 'px-2 py-1 text-sm' : ''}`}
                  >
                    Download Failed CSV
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setBulkResult(null)}>Dismiss</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal (NEW) */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className={`max-w-md w-[95vw] ${isTablet ? 'p-3' : 'p-4'}`}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className={smallText}>Member</Label>
              <div className="font-medium">{paymentMember?.name}</div>
            </div>

            <div>
              <Label className={smallText}>Total Pending</Label>
              <div className="font-semibold">
                {paymentMember ? formatCurrencyINR(pendingMap[paymentMember.id]?.total_pending_amount ?? 0) : '—'}
              </div>
            </div>

            <div>
              <Label className={smallText}>Apply To Membership</Label>
              <Select value={paymentSelectedMembershipId || ''} onValueChange={(v: any) => setPaymentSelectedMembershipId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select membership (pending)" />
                </SelectTrigger>
                <SelectContent>
                  {(paymentMember && pendingMap[paymentMember.id]?.memberships?.length > 0 ? pendingMap[paymentMember.id].memberships : []).map((m: any) => (
                    <SelectItem key={m.member_membership_id} value={m.member_membership_id}>
                      {m.membership_name || m.membership_id} — {formatCurrencyINR(m.pending_amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={smallText}>Amount to pay</Label>
              <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter amount" />
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={closePaymentModal}>Cancel</Button>
              <Button onClick={handleSubmitPayment} className="bg-gradient-to-r from-neon-green to-neon-blue text-white" disabled={paymentLoading}>
                {paymentLoading ? 'Saving...' : 'Apply Payment'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className={`max-w-[95vw] ${dialogMaxW} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className={`${dialogPadding}`}>
            <DialogTitle className="flex items-center justify-between">
              Member Profile
              {!isEditing && <Button variant="outline" size={isTablet ? "sm" : "sm"} onClick={handleEditProfile}><Edit className={`${iconClass} mr-2`} />Edit</Button>}
            </DialogTitle>
          </DialogHeader>

          {selectedMember && editedMember && (
            <div className={`${isTablet ? 'grid gap-3 py-2 px-2' : 'grid gap-6 py-4 px-1 sm:px-2'}`}>
              <div className="flex items-start gap-3">
                <div className={`${avatarSizeClass} bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white`}>
                  {selectedMember.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  {isEditing ? (
                    <Input value={editedMember.name} onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })} className={`${isTablet ? 'text-sm font-semibold' : 'text-lg font-semibold'}`} />
                  ) : <h3 className={`${isTablet ? 'text-sm font-semibold' : 'text-lg font-semibold'}`}>{selectedMember.name}</h3>}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMember.status)}
                    <Badge variant="outline" className={isTablet ? 'text-xs' : ''}>{selectedMember.planType}</Badge>
                    {selectedMember.age !== undefined ? (
                      <Badge className={`${isTablet ? 'text-xs' : 'text-sm'}`}>{selectedMember.age} yrs</Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className={`${isTablet ? 'font-medium text-xs' : 'font-medium'}`}>Contact Information</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <Label className={`${smallText}`}>Email</Label>
                    {isEditing ? <Input type="email" value={editedMember.email} onChange={(e) => setEditedMember({ ...editedMember, email: e.target.value })} /> : <p className={`${smallText} text-muted-foreground`}>{selectedMember.email}</p>}
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Phone</Label>
                    {isEditing ? <Input value={editedMember.phone} onChange={(e) => setEditedMember({ ...editedMember, phone: e.target.value })} /> : <p className={`${smallText} text-muted-foreground`}>{selectedMember.phone}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <Label className={`${smallText}`}>Date of Birth</Label>
                    {isEditing ? <Input type="date" value={editedMember.dob ? new Date(editedMember.dob).toISOString().slice(0, 10) : ''} onChange={(e) => setEditedMember({ ...editedMember, dob: e.target.value })} /> : <p className={`${smallText} text-muted-foreground`}>{selectedMember.dob ? formatPretty(selectedMember.dob) : 'Not provided'}</p>}
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Age</Label>
                    <p className={`${smallText} text-muted-foreground`}>{selectedMember.age !== undefined ? `${selectedMember.age} years` : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className={`${smallText}`}>Address</Label>
                  {isEditing ? <Textarea value={editedMember.address || ''} onChange={(e) => setEditedMember({ ...editedMember, address: e.target.value })} rows={2} /> : <p className={`${smallText} text-muted-foreground`}>{selectedMember.address || 'Not provided'}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className={`${isTablet ? 'font-medium text-xs' : 'font-medium'}`}>Membership Information</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <Label className={`${smallText}`}>Amount</Label>
                    <p className={`${smallText} text-neon-green font-medium`}>{formatCurrencyINR(selectedMember?.amount)}</p>
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Start Date</Label>
                    <p className={`${smallText} text-muted-foreground`}>{selectedMember.startDate ? new Date(selectedMember.startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className={`${smallText}`}>End Date</Label>
                    <p className={`${smallText} text-muted-foreground`}>{selectedMember?.lastPayment ? formatPretty(selectedMember.lastPayment) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className={`${smallText}`}>Notes</Label>
                {isEditing ? <Textarea value={editedMember.notes || ''} onChange={(e) => setEditedMember({ ...editedMember, notes: e.target.value })} rows={3} /> : <p className={`${smallText} text-muted-foreground`}>{selectedMember.notes || 'No notes available'}</p>}
              </div>
            </div>
          )}

          <DialogFooter className={`${dialogPadding}`}>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancelEdit}><X className={`${iconClass} mr-2`} />Cancel</Button>
                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-neon-green to-neon-blue text-white" disabled={loading}><Save className={`${iconClass} mr-2`} />Save Changes</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {/* Delete/Restore moved here from table actions */}
                {selectedMember?.is_active === false || selectedMember?.status === 'expired' ? (
                  <Button variant="ghost" size="sm" onClick={() => selectedMember && handleRestore(selectedMember.id)} className={`text-green-600 hover:bg-neon-green/10 ${isTablet ? 'px-2 py-1 text-sm' : ''}`}>Restore</Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => selectedMember && handleDelete(selectedMember.id)} className={`text-red-500 hover:bg-red-500/10 ${isTablet ? 'px-2 py-1' : ''}`}>
                    Delete
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Membership Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className={`max-w-[95vw] ${dialogMaxW} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className={`${dialogPadding}`}>
            <DialogTitle className={`${isTablet ? 'text-base' : ''}`}>Assign Membership</DialogTitle>
            <div className={`${smallText} text-muted-foreground`}>Assign a membership plan to {assignMember?.name}</div>
          </DialogHeader>

          <div className={`grid gap-2 py-2 px-2`}>
            <div>
              <Label className={`${smallText}`}>Membership Plan</Label>
              <Select value={selectedMembershipId} onValueChange={(v: any) => setSelectedMembershipId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={membershipOptionsLoading ? 'Loading...' : 'Select plan'} />
                </SelectTrigger>
                <SelectContent>
                  {membershipOptions.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} {m.price ? `- ${formatCurrencyINR(m.price)}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeMembershipInfo && (
              <div className="p-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm">
                <div className="font-medium">Active membership detected</div>
                <div>{activeMembershipInfo.membership_name} — ends {formatPretty(activeMembershipInfo.end_date)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  New membership default start set to the next available day after current membership end. You can edit the start date if you wish.
                </div>
              </div>
            )}

            {/* NEW: display membership_name, payment_type, amount_paid and pending_amount */}
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <Label className={`${smallText}`}>Membership Name</Label>
                <Input value={assignMembershipName} readOnly placeholder="Selected membership name appears here" />
              </div>

              <div>
                <Label className={`${smallText}`}>Payment Type</Label>
                <Select value={assignPaymentType} onValueChange={(v: any) => setAssignPaymentType(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <Label className={`${smallText}`}>Amount Paid</Label>
                <Input
                  type="number"
                  value={assignAmountPaid}
                  onChange={(e) => setAssignAmountPaid(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the amount paid now. Pending amount will auto-update.</p>
              </div>

              <div>
                <Label className={`${smallText}`}>Pending Amount</Label>
                <Input value={assignPendingAmount !== null ? String(assignPendingAmount) : ''} readOnly />
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated: plan price minus amount paid.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className={`${smallText}`}>Start Date</Label>
                <Input type="date" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Start is auto set to today or next available day after current membership end.</p>
              </div>
              <div>
                <Label className={`${smallText}`}>End Date</Label>
                <Input type="date" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">End date auto-calculated from the selected plan's duration (editable).</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className={`${smallText}`}>Payment Status</Label>
                <Select value={assignPaymentStatus} onValueChange={(v: any) => setAssignPaymentStatus(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={`${smallText}`}>Membership Status</Label>
                <Select value={assignStatus} onValueChange={(v: any) => setAssignStatus(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className={`${dialogPadding}`}>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignSubmit} className="bg-gradient-to-r from-neon-green to-neon-blue text-white" disabled={assignLoading}>
              {assignLoading ? 'Assigning...' : 'Assign Membership'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing Management Dialog */}
      <Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen}>
        <DialogContent className={`max-w-[95vw] ${dialogMaxW} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className={`${dialogPadding}`}>
            <DialogTitle className={`${isTablet ? 'text-base' : ''}`}>Billing Management</DialogTitle>
            <div className={`${smallText} text-muted-foreground`}>Manage payment and billing information for {billingMember?.name}</div>
          </DialogHeader>

          {billingMember && (
            <div className={`grid gap-3 py-2 px-2`}>
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <div className={`${avatarSizeClass} bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white`}>
                  {billingMember.name.charAt(0)}
                </div>
                <div>
                  <h4 className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>{billingMember.name}</h4>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>Memberships</h4>
                  <Button size="sm" variant="ghost" onClick={() => openAssignDialog(billingMember)}>
                    <CreditCard className={`${iconClass} mr-2`} />Assign
                  </Button>
                </div>

                {membershipLoading ? (
                  <p className={`${smallText} text-muted-foreground`}>Loading memberships...</p>
                ) : memberMemberships.length === 0 ? (
                  <p className={`${smallText} text-muted-foreground`}>No membership records found for this member.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-auto pr-2">
                    {memberMemberships.map((mm) => (
                      <div key={mm.id} className={`p-2 border rounded-lg ${isTablet ? 'text-sm' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>{mm.membership_name || '—'}</div>
                            <div className={`${smallText} text-muted-foreground`}>
                              {mm.start_date ? new Date(mm.start_date).toLocaleDateString() : 'N/A'} to {mm.end_date ? new Date(mm.end_date).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`${smallText}`}>{mm.payment_status || mm.status || '—'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Info & Status */}
              <div className="space-y-2">
                <h4 className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>Payment Information</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <Label className={`${smallText}`}>Current Plan</Label>
                    <p className={`${smallText} text-muted-foreground`}>{billingMember.planType || '—'}</p>
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Amount</Label>
                    <p className={`${smallText} text-neon-green font-medium`}>{formatCurrencyINR(billingMember.amount)}</p>
                  </div>
                  <div>
                    <Label className={`${smallText}`}>Next Billing</Label>
                    <p className={`${smallText} text-muted-foreground`}>{billingMember.nextBilling ? formatPretty(billingMember.nextBilling) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>Payment Status</h4>
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {billingHasActive ? getStatusBadge('active') : getStatusBadge('expired')}
                    <span className={`${smallText}`}>
                      {billingHasActive
                        ? 'Payment up to date (active membership present)'
                        : 'No active membership — expired or not paid'}
                    </span>
                  </div>
                  {billingHasActive ? (
                    <div className={`${smallText} text-muted-foreground`}>
                      Active memberships: {billingActiveItems.length}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>Quick Actions</h4>
                <div className="grid gap-2">
                  <Button variant="outline" className={`justify-start ${isTablet ? 'px-2 py-1 text-sm' : ''}`} onClick={() => openAssignDialog(billingMember)}>
                    <CreditCard className={`${iconClass} mr-2`} />Assign Membership
                  </Button>

                  <Button
                    variant="outline"
                    className={`justify-start ${isTablet ? 'px-2 py-1 text-sm' : ''}`}
                    onClick={() => billingMember?.id && handleSendMemberNextPaymentReminder(billingMember.id)}
                    disabled={Boolean(sendingMemberReminder) && sendingMemberReminder !== billingMember?.id}
                  >
                    <Mail className={`${iconClass} mr-2`} />
                    {sendingMemberReminder === billingMember?.id ? 'Sending...' : 'Send Payment Reminder'}
                  </Button>

                </div>
              </div>
            </div>
          )}

          <DialogFooter className={`${dialogPadding}`}>
            <Button variant="outline" onClick={() => setIsBillingOpen(false)}>Close</Button>
            <Button onClick={handleUpdatePayment} className="bg-gradient-to-r from-neon-green to-neon-blue text-white">Update Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border/50">
        <CardContent className={`${cardPadding}`}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isTablet ? 'w-3 h-3' : 'w-4 h-4'}`} />
              <Input placeholder="Search members by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${isTablet ? 'pl-9 py-2 text-sm' : 'pl-10'}`} />
            </div>
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className={`w-[160px] ${isTablet ? 'text-sm' : ''}`}>
                  <Filter className={`${isTablet ? 'w-3 h-3 mr-2' : 'w-4 h-4 mr-2'}`} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members ({memberCounts.all})</SelectItem>
                  <SelectItem value="active">Active ({memberCounts.active})</SelectItem>
                  <SelectItem value="expired">Expired ({memberCounts.expired})</SelectItem>
                  <SelectItem value="pending">Pending ({memberCounts.pending})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className={`${isTablet ? 'px-3 py-2' : ''}`}>
          <CardTitle className={`${isTablet ? 'text-lg' : ''}`}>
            Members ({selectedFilter === 'all' && !searchTerm ? totalMembers : filteredMembers.length})
          </CardTitle>
          <CardDescription className={`${isTablet ? 'text-xs' : ''}`}>{selectedFilter === 'all' ? 'All registered members' : `Members with ${selectedFilter} status`}</CardDescription>
        </CardHeader>

        <CardContent className={`${isTablet ? 'p-2' : ''}`}>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className={`${isTablet ? '' : ''}`}>
                  <TableHead>Member No</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Next Payment</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className={`${isTablet ? '' : ''}`}>
                    <TableCell>
                      <div className={`${tableRowPadding}`}>
                        <div className={`${isTablet ? 'text-xs font-medium' : 'text-sm font-medium'}`}>
                          {member.member_no || '—'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className={`flex items-center gap-3 ${tableRowPadding}`}>
                        <div className={`${avatarSizeClass} bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white`}>{member.name.charAt(0)}</div>
                        <div>
                          <div className={`${isTablet ? 'font-medium text-sm' : 'font-medium'}`}>{member.name}</div>
                          <div className={`text-sm text-muted-foreground sm:hidden ${isTablet ? 'text-xs' : ''}`}>{member.email}{member.age !== undefined ? ` • ${member.age} yrs` : ''}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className={`${smallText} flex items-center gap-2`}><Mail className={`${isTablet ? 'w-3 h-3' : 'w-3 h-3'}`} />{member.email}</div>
                        <div className={`${smallText} flex items-center gap-2 text-muted-foreground`}><Phone className={`${isTablet ? 'w-3 h-3' : 'w-3 h-3'}`} />{member.phone}{member.age !== undefined ? ` • ${member.age} yrs` : ''}</div>
                      </div>
                    </TableCell>

                    {/* Next Payment column (replaces previous Period column) */}
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {member.next_payment_date ? (
                          <div className={`${smallText}`}>{formatPretty(member.next_payment_date)}</div>
                        ) : nextPaymentLoading[member.id] ? (
                          <div className={`${smallText} text-muted-foreground`}>Loading...</div>
                        ) : nextPaymentMap[member.id] ? (
                          <div className={`${smallText}`}>{formatPretty(nextPaymentMap[member.id])}</div>
                        ) : (
                          <div className={`${smallText} text-muted-foreground`}>N/A</div>
                        )}
                      </div>
                    </TableCell>

                    {/* Payment status column (replaces previous status column) */}
                    <TableCell>{getPaymentBadgeForMember(member)}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProfile(member)} className={`hover:bg-neon-green/10 hover:text-neon-green ${isTablet ? 'px-2 py-1' : ''}`}><User className={`${iconClass}`} /></Button>

                        <Button variant="ghost" size="sm" onClick={() => handleViewBilling(member)} className={`hover:bg-neon-blue/10 hover:text-neon-blue ${isTablet ? 'px-2 py-1' : ''}`}><CreditCard className={`${iconClass}`} /></Button>

                        {/* Delete/Restore removed from table actions and moved to profile modal */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Loading indicator / Sentinel for infinite scroll */}
          <div ref={observerTarget} className="h-10 flex items-center justify-center w-full mt-4">
            {isFetchingMore && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading more members...
              </div>
            )}
            {!hasMore && members.length > 0 && (
              <p className="text-xs text-muted-foreground">No more members to load</p>
            )}
          </div>

        </CardContent>
      </Card>
    </div >
  );
}
