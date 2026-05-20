import { Product } from "@/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find((i) => i.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalQuantity += 1;
      state.totalPrice += Number(action.payload.price || 0);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((i) => i.id === action.payload);
      if (index !== -1) {
        const item = state.items[index];
        state.totalQuantity -= 1;
        state.totalPrice -= Number(item.price || 0);

        if (item.quantity === 1) {
          state.items.splice(index, 1);
        } else {
          item.quantity -= 1;
        }
      }
    },

    clearItemFromCart: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        const item = state.items[index];
        state.totalQuantity -= item.quantity;
        state.totalPrice -= Number(item.price || 0) * item.quantity;
        state.items.splice(index, 1);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },

    syncCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.totalQuantity = action.payload.reduce(
        (sum, item) => sum + (item.quantity ?? 1),
        0,
      );
      state.totalPrice = action.payload.reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.quantity ?? 1),
        0,
      );
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearItemFromCart,
  clearCart,
  syncCart,
} = cartSlice.actions;

export default cartSlice.reducer;
