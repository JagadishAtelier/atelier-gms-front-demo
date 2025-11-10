import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Dumbbell, 
  Apple, 
  Send, 
  MessageSquare, 
  Mail,
  Calendar,
  Clock,
  User,
  Target
} from 'lucide-react';

interface Plan {
  id: string;
  title: string;
  type: 'workout' | 'diet';
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  assignedTo: string[];
  createdDate: string;
  goals: string[];
}

const mockPlans: Plan[] = [
  {
    id: '1',
    title: 'Full Body Strength Training',
    type: 'workout',
    description: 'A comprehensive strength training program focusing on all major muscle groups. Includes progressive overload principles.',
    duration: '8 weeks',
    difficulty: 'intermediate',
    assignedTo: ['John Smith', 'Emily Davis'],
    createdDate: '2024-02-15',
    goals: ['Build muscle mass', 'Increase strength', 'Improve posture']
  },
  {
    id: '2',
    title: 'Weight Loss Nutrition Plan',
    type: 'diet',
    description: 'Balanced nutrition plan for sustainable weight loss. Includes meal prep guides and portion control.',
    duration: '12 weeks',
    difficulty: 'beginner',
    assignedTo: ['Sarah Johnson', 'Mike Wilson'],
    createdDate: '2024-02-10',
    goals: ['Weight loss', 'Healthy habits', 'Energy boost']
  },
  {
    id: '3',
    title: 'HIIT Cardio Blast',
    type: 'workout',
    description: 'High-intensity interval training for maximum calorie burn and cardiovascular improvement.',
    duration: '6 weeks',
    difficulty: 'advanced',
    assignedTo: ['Alex Brown'],
    createdDate: '2024-02-20',
    goals: ['Fat burning', 'Cardio endurance', 'Time efficiency']
  },
  {
    id: '4',
    title: 'Muscle Building Meal Plan',
    type: 'diet',
    description: 'High-protein nutrition plan designed to support muscle growth and recovery.',
    duration: '10 weeks',
    difficulty: 'intermediate',
    assignedTo: ['John Smith', 'Alex Brown'],
    createdDate: '2024-02-12',
    goals: ['Muscle gain', 'Recovery support', 'Performance']
  }
];

export function WorkoutPlans() {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    type: 'workout' as 'workout' | 'diet',
    description: '',
    duration: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goals: ''
  });

  const filteredPlans = mockPlans.filter(plan => {
    if (activeTab === 'all') return true;
    return plan.type === activeTab;
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">Beginner</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Advanced</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'workout' 
      ? <Badge className="bg-neon-blue/10 text-neon-blue border-neon-blue/20">Workout</Badge>
      : <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Diet</Badge>;
  };

  const handleCreatePlan = () => {
    console.log('Creating new plan:', newPlan);
    setIsCreatePlanOpen(false);
    setNewPlan({
      title: '',
      type: 'workout',
      description: '',
      duration: '',
      difficulty: 'beginner',
      goals: ''
    });
  };

  const planCounts = {
    all: mockPlans.length,
    workout: mockPlans.filter(p => p.type === 'workout').length,
    diet: mockPlans.filter(p => p.type === 'diet').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Workout & Diet Plans</h1>
          <p className="text-muted-foreground">Create and manage personalized fitness and nutrition plans</p>
        </div>
        
        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <DialogDescription>
                Create a personalized workout or diet plan for your members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input
                  id="title"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                  placeholder="Enter plan title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Plan Type</Label>
                  <Select value={newPlan.type} onValueChange={(value: 'workout' | 'diet') => setNewPlan({...newPlan, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout">Workout Plan</SelectItem>
                      <SelectItem value="diet">Diet Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={newPlan.difficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setNewPlan({...newPlan, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})}
                  placeholder="e.g., 8 weeks, 3 months"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goals">Goals (comma separated)</Label>
                <Input
                  id="goals"
                  value={newPlan.goals}
                  onChange={(e) => setNewPlan({...newPlan, goals: e.target.value})}
                  placeholder="e.g., Build muscle, Lose weight, Improve endurance"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Detailed description of the plan..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreatePlan} className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="all">All Plans ({planCounts.all})</TabsTrigger>
          <TabsTrigger value="workout">Workout ({planCounts.workout})</TabsTrigger>
          <TabsTrigger value="diet">Diet ({planCounts.diet})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="border-border/50 hover:border-border transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      {plan.type === 'workout' ? (
                        <Dumbbell className="w-5 h-5 text-neon-blue" />
                      ) : (
                        <Apple className="w-5 h-5 text-purple-500" />
                      )}
                      {getTypeBadge(plan.type)}
                    </div>
                    {getDifficultyBadge(plan.difficulty)}
                  </div>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {plan.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(plan.createdDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Goals
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {plan.goals.slice(0, 2).map((goal, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                      {plan.goals.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.goals.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Assigned Members ({plan.assignedTo.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {plan.assignedTo.slice(0, 2).map((member, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {member}
                        </Badge>
                      ))}
                      {plan.assignedTo.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{plan.assignedTo.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Plans Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-green">{mockPlans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month: +{Math.floor(mockPlans.length * 0.3)} new plans
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Members with Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-neon-blue">
              {new Set(mockPlans.flatMap(p => p.assignedTo)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique members with active plans
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Plans Sent This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-400">23</div>
            <p className="text-xs text-muted-foreground mt-1">
              Via WhatsApp and Email
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Template Library */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Plan Templates</CardTitle>
          <CardDescription>Quick-start templates for common fitness goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <Dumbbell className="w-6 h-6 text-neon-green" />
              <span className="font-medium">Beginner Strength</span>
              <span className="text-xs text-muted-foreground">3-day full body routine</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <Target className="w-6 h-6 text-neon-blue" />
              <span className="font-medium">Fat Loss HIIT</span>
              <span className="text-xs text-muted-foreground">High-intensity cardio plan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <Apple className="w-6 h-6 text-purple-500" />
              <span className="font-medium">Weight Loss Diet</span>
              <span className="text-xs text-muted-foreground">Balanced nutrition plan</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2 text-left">
              <User className="w-6 h-6 text-orange-500" />
              <span className="font-medium">Muscle Building</span>
              <span className="text-xs text-muted-foreground">High-protein meal plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}