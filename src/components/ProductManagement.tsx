import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2 } from "lucide-react";
import productService from "../service/productService";
import BASE_API from "../api/baseurl";

// Product type
export interface Product {
  id: string;
  title: string;
  price: string;
  compprice?: string;
  image?: string;
}

const initialProducts: Product[] = [
  {
    id: "1",
    title: "Ancient Omegas Pills",
    price: "₹990.00",
    compprice: "₹1990.00",
    image:
      "https://i.pinimg.com/236x/64/e7/fa/64e7fae47ea47b453233049765d29521.jpg",
  },
  {
    id: "2",
    title: "Alpha Potential Pre-Workout",
    price: "₹999.00",
    compprice: "₹1599.00",
    image:
      "https://i.pinimg.com/236x/41/93/1c/41931ce3b2ea6a63cd47055a241416b9.jpg",
  },
];

export default function ProductManagement() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<Omit<Product, "id">>({
    title: "",
    price: "",
    compprice: "",
    image: "",
  });

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);

  const parsePriceToNumber = (priceStr: string) => {
    const onlyNumber = priceStr.replace(/[^\d.]/g, "");
    return Number.parseFloat(onlyNumber || "0");
  };

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ page: 1, limit: 50 });
      const list = res?.data?.data || res?.data || res?.items || [];

      const mapped: Product[] = list.map((p: any) => {
        const imgUrl = p.product_image_url
          ? p.product_image_url.startsWith("/uploads")
            ? `${BASE_API}${p.product_image_url}`
            : p.product_image_url
          : undefined;

        return {
          id: p.id,
          title: p.title,
          price: `₹${Number(p.price).toFixed(2)}`,
          compprice: p.compprice ? `₹${p.compprice}` : undefined,
          image: imgUrl,
        } as Product;
      });

      setProducts(mapped.length ? mapped : initialProducts);
    } catch (e) {
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setForm((prev) => ({
        ...prev,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // simple validation
    if (!form.title?.trim()) {
      alert("Title is required");
      return;
    }
    if (!form.price?.trim()) {
      alert("Price is required");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("price", String(parsePriceToNumber(form.price)));

      if (form.compprice) fd.append("compprice", String(parsePriceToNumber(form.compprice)));
      if (imageFile) {
        // backend multer expects field name "image"
        fd.append("image", imageFile);
      }

      // call service that sends FormData (no content-type explicitly set)
      const res = await productService.createProduct(fd);
      // server may return product object directly or in res.data
      const p = res?.data || res;

      // compute image url returned by server
      let imageUrl: string | undefined = undefined;
      if (p?.product_image_url) {
        imageUrl = p.product_image_url.startsWith("/uploads")
          ? `${BASE_API}${p.product_image_url}`
          : p.product_image_url;
      } else if (form.image) {
        imageUrl = form.image; // fallback to preview
      }

      const newProduct: Product = {
        id: p.id,
        title: p.title,
        price: `₹${Number(p.price).toFixed(2)}`,
        image: imageUrl,
      };

      setProducts((prev) => [newProduct, ...prev]);
      setForm({ title: "", price: "", compprice: "", image: "" });
      setImageFile(null);
      setOpen(false);
    } catch (err: any) {
      alert(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
          <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-green to-neon-blue px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90">
  <Plus size={16} /> Add Product
</button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="bg-background fixed top-[50%] left-[50%] z-50 max-w-[525px] translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold">
                Add Product
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />

                <input
                  name="compprice"
                  value={form.compprice}
                  onChange={handleChange}
                  placeholder="Compare Price (optional)"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />

                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-auto rounded-md object-cover"
                    style={{ height: "100px" }}
                  />
                )}

                <div className="flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button type="button" className="rounded-md border px-4 py-2 text-sm">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-gradient-to-r from-neon-green to-neon-blue px-4 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {loading && <div>Loading...</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border-2 border-border/80 bg-white">
            <img
              src={product.image || "https://via.placeholder.com/400x300"}
              alt={product.title}
              className="w-full object-cover"
              style={{ height: "250px" }}
            />

            <div className="p-4 space-y-2">
              <h3 className="font-semibold">{product.title}</h3>
              <span className="text-lg text-red-600 font-bold">
                {product.price}
              </span>

              <button
                onClick={() => deleteProduct(product.id)}
                className="mt-2 mx-auto flex items-center gap-2 rounded-md bg-gradient-to-r from-neon-green to-neon-blue px-4 py-2 text-sm text-white"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div >
  );
}
