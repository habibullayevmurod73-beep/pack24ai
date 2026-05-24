import { act } from '@testing-library/react';
import { useWishlistStore, WishlistItem } from '@/lib/store/useWishlistStore';

const makeItem = (id: string, overrides?: Partial<WishlistItem>): WishlistItem => ({
    productId: id,
    name: `Product ${id}`,
    price: 100,
    addedAt: Date.now(),
    ...overrides,
});

const store = () => useWishlistStore.getState();

beforeEach(() => {
    act(() => useWishlistStore.setState({ items: [] }));
});

describe('useWishlistStore', () => {
    describe('initial state', () => {
        it('starts with an empty items array', () => {
            expect(store().items).toEqual([]);
        });
    });

    describe('addToWishlist', () => {
        it('adds a product', () => {
            act(() => store().addToWishlist(makeItem('1')));
            expect(store().items).toHaveLength(1);
            expect(store().items[0].productId).toBe('1');
        });

        it('prevents duplicate product IDs', () => {
            const item = makeItem('1');
            act(() => {
                store().addToWishlist(item);
                store().addToWishlist(item);
            });
            expect(store().items).toHaveLength(1);
        });

        it('allows different product IDs', () => {
            act(() => {
                store().addToWishlist(makeItem('1'));
                store().addToWishlist(makeItem('2'));
            });
            expect(store().items).toHaveLength(2);
        });
    });

    describe('removeFromWishlist', () => {
        it('removes an existing product', () => {
            act(() => {
                store().addToWishlist(makeItem('1'));
                store().removeFromWishlist('1');
            });
            expect(store().items).toHaveLength(0);
        });

        it('does nothing for a non-existent ID', () => {
            act(() => {
                store().addToWishlist(makeItem('1'));
                store().removeFromWishlist('999');
            });
            expect(store().items).toHaveLength(1);
        });
    });

    describe('isInWishlist', () => {
        it('returns true for an item in the list', () => {
            act(() => store().addToWishlist(makeItem('1')));
            expect(store().isInWishlist('1')).toBe(true);
        });

        it('returns false for an item not in the list', () => {
            expect(store().isInWishlist('1')).toBe(false);
        });
    });

    describe('clearWishlist', () => {
        it('removes all items', () => {
            act(() => {
                store().addToWishlist(makeItem('1'));
                store().addToWishlist(makeItem('2'));
                store().clearWishlist();
            });
            expect(store().items).toEqual([]);
        });
    });

    describe('toggleWishlist', () => {
        it('adds the item if not present', () => {
            act(() => store().toggleWishlist(makeItem('1')));
            expect(store().isInWishlist('1')).toBe(true);
        });

        it('removes the item if already present', () => {
            act(() => {
                store().addToWishlist(makeItem('1'));
                store().toggleWishlist(makeItem('1'));
            });
            expect(store().isInWishlist('1')).toBe(false);
        });

        it('toggles back and forth correctly', () => {
            const item = makeItem('1');
            act(() => store().toggleWishlist(item));
            expect(store().isInWishlist('1')).toBe(true);

            act(() => store().toggleWishlist(item));
            expect(store().isInWishlist('1')).toBe(false);

            act(() => store().toggleWishlist(item));
            expect(store().isInWishlist('1')).toBe(true);
        });
    });
});
