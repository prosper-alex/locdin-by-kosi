import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container error-page">
      <h1>This strand leads elsewhere.</h1>
      <p>We couldn’t find that page. Your next style is still waiting.</p>
      <Link href="/shop" className="button">
        Explore the collection
      </Link>
    </div>
  );
}
