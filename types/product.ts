export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  is_active: boolean;
  category: string;
  category_details?: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  image: string;
  images?: any[];
  inCart?: boolean;
}
