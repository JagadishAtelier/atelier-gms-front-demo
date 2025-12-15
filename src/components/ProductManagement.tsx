import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2 } from "lucide-react";

// Product type (ONLY required fields)
export interface Product {
    id: string;
    title: string;
    price: string;
    compprice: string;
    image: string;
}

// Mock data
const initialProducts: Product[] = [
    {
        id: "1",
        title: "Ancient Omegas Pills",
        price: "₹990.00",
        compprice: "₹1990.00",
        image: "https://i.pinimg.com/236x/64/e7/fa/64e7fae47ea47b453233049765d29521.jpg",
    },
    {
        id: "2",
        title: "Alpha Potential Pre-Workout",
        price: "₹999.00",
        compprice: "₹1599.00",
        image: "https://i.pinimg.com/236x/41/93/1c/41931ce3b2ea6a63cd47055a241416b9.jpg",
    },
];

export default function ProductManagement() {
    const [products, setProducts] = React.useState<Product[]>(initialProducts);
    const [open, setOpen] = React.useState(false);

    const [form, setForm] = React.useState<Omit<Product, "id">>({
        title: "",
        price: "",
        compprice: "",
        image: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.price || !form.image) return;

        setProducts((prev) => [
            ...prev,
            { id: crypto.randomUUID(), ...form },
        ]);

        setForm({ title: "", price: "", compprice: "", image: "" });
        setOpen(false);
    };

    const deleteProduct = (id: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>

                <Dialog.Root open={open} onOpenChange={setOpen}>
                    <Dialog.Trigger asChild>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                            <Plus size={16} /> Add Product
                        </button>
                    </Dialog.Trigger>

                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                        <Dialog.Content className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-[525px] w-full flex flex-col max-h-[80vh]">
                            <Dialog.Title className="text-lg font-semibold">Add Product</Dialog.Title>

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
                                    placeholder="Compare Price"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                />
                                {/* Image Upload */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const previewUrl = URL.createObjectURL(file);
                                        setForm((prev) => ({ ...prev, image: previewUrl }));
                                    }}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                />


                                {form.image && (
                                    <img
                                        src={form.image}
                                        alt="Preview"
                                        className="w-auto rounded-md object-cover"
                                        style={{height:'100px',width:"auto"}}
                                    />
                                )}

                                <div className="flex justify-end gap-2">
                                    <Dialog.Close asChild>
                                        <button type="button" className="rounded-md border px-4 py-2 text-sm">Cancel</button>
                                    </Dialog.Close>
                                    <button type="submit" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 bg-gradient-to-r from-neon-green to-neon-blue text-white">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <div key={product.id} className="overflow-hidden rounded-xl border bg-white">
                        <img src={product.image} alt={product.title} className="w-full object-cover" style={{height:'250px'}} />

                        <div className="p-4 space-y-2">
                            <h3 className="font-semibold">{product.title}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-lg text-red-600" style={{fontWeight:'700'}}>{product.price}</span>
                                <span className="text-sm line-through text-gray-400" style={{textDecoration:"line-through",opacity:0.6}}>{product.compprice}</span>
                            </div>

                            <button
                                onClick={() => deleteProduct(product.id)}
                                className="mt-2 mx-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 bg-gradient-to-r from-neon-green to-neon-blue text-white"
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}