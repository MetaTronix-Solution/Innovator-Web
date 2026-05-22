import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

interface ProductsState {
  items: Product[];
  hasMore: boolean;
  page: number;
  lastFetched: number | null;
}

const initialState: ProductsState = {
  items: [],
  hasMore: true,
  page: 1,
  lastFetched: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.lastFetched = Date.now();
    },
    appendProducts: (state, action: PayloadAction<Product[]>) => {
      const existingIds = new Set(state.items.map((p) => p.id));
      const newItems = action.payload.filter((p) => !existingIds.has(p.id));
      state.items = [...state.items, ...newItems];
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
});

export const { setProducts, appendProducts, setHasMore, setPage } =
  productsSlice.actions;
export default productsSlice.reducer;
