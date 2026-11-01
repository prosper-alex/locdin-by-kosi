import { Bag } from "@/components/bag";
export const metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};
export default function CartPage() {
  return <Bag />;
}
