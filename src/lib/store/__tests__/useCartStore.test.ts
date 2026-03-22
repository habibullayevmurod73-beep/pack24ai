/**
 * useCartStore unit testlari
 * Zustand vanilla API (renderHook kerak emas)
 * Run: npm test
 */
import { useCartStore } from '@/lib/store/useCartStore';

// Zustand store ni har testdan oldin tozalash
beforeEach(() => {
    useCartStore.setState({ items: [] });
});

describe('useCartStore', () => {
    it("boshlang'ichda bo'sh bo'lishi kerak", () => {
        const { items } = useCartStore.getState();
        expect(items).toHaveLength(0);
    });

    it("mahsulot qo'shish", () => {
        const { addToCart } = useCartStore.getState();

        addToCart({
            productId: 1,
            name: 'Test Quti',
            price: 50000,
            image: '/test.jpg',
            quantity: 2,
        });

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0].quantity).toBe(2);
        expect(items[0].name).toBe('Test Quti');
    });

    it("bir xil mahsulot qo'shilganda miqdor oshishi kerak", () => {
        const { addToCart } = useCartStore.getState();

        addToCart({ productId: 1, name: 'Quti', price: 50000, image: '/t.jpg', quantity: 1 });
        addToCart({ productId: 1, name: 'Quti', price: 50000, image: '/t.jpg', quantity: 3 });

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0].quantity).toBe(4);
    });

    it("mahsulot o'chirish", () => {
        const { addToCart, removeFromCart } = useCartStore.getState();

        addToCart({ productId: 1, name: 'Quti', price: 50000, image: '/t.jpg', quantity: 1 });
        addToCart({ productId: 2, name: 'Paket', price: 10000, image: '/p.jpg', quantity: 2 });
        removeFromCart(1);

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0].productId).toBe(2);
    });

    it("miqdorni yangilash", () => {
        const { addToCart, updateQuantity } = useCartStore.getState();

        addToCart({ productId: 1, name: 'Quti', price: 50000, image: '/t.jpg', quantity: 1 });
        updateQuantity(1, 5);

        const { items } = useCartStore.getState();
        expect(items[0].quantity).toBe(5);
    });

    it("totalAmount to'g'ri hisoblanishi kerak", () => {
        const { addToCart, totalAmount } = useCartStore.getState();

        addToCart({ productId: 1, name: 'A', price: 10000, image: '/a.jpg', quantity: 3 });
        addToCart({ productId: 2, name: 'B', price: 5000, image: '/b.jpg', quantity: 2 });

        // 10000*3 + 5000*2 = 40000
        expect(totalAmount()).toBe(40000);
    });

    it("getTotalItems to'g'ri hisoblanishi kerak", () => {
        const { addToCart, getTotalItems } = useCartStore.getState();

        addToCart({ productId: 1, name: 'A', price: 10000, image: '/a.jpg', quantity: 3 });
        addToCart({ productId: 2, name: 'B', price: 5000, image: '/b.jpg', quantity: 2 });

        expect(getTotalItems()).toBe(5);
    });

    it("clearCart hammani tozalashi kerak", () => {
        const { addToCart, clearCart, totalAmount } = useCartStore.getState();

        addToCart({ productId: 1, name: 'Quti', price: 50000, image: '/t.jpg', quantity: 5 });
        clearCart();

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(0);
        expect(totalAmount()).toBe(0);
    });
});
