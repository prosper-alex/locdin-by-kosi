import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireAdmin, supabaseConfigured } from "@/lib/supabase/server";
import { previewProducts } from "@/data/catalogue";
import { previewDestinations, money } from "@/lib/international";
import { AdminProductForm } from "@/components/admin-product-form";
import {
  login,
  logout,
  updateOrder,
  updateEnquiry,
  updateShipping,
} from "../actions";
import type { Product } from "@/lib/types";
export const metadata = {
  title: "Studio management",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Admin({
  params,
  searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { section = [] } = await params;
  const query = await searchParams;
  const view = section[0] || "products";
  if (view === "login")
    return (
      <div className="container">
        <div className="admin-login">
          <h1>Welcome to the studio.</h1>
          <p>For invited Loc’din by Kosi administrators.</p>
          {!supabaseConfigured() ? (
            <div className="quiet-note">
              <p>Studio access isn’t connected yet.</p>
              <p>
                Configure Supabase and invite an administrator to enable secure
                sign-in. There is no public registration.
              </p>
              <Link className="text-link" href="/admin">
                See the setup overview
              </Link>
            </div>
          ) : (
            <form action={login} className="stack">
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                />
              </label>
              {query.error && (
                <p className="form-error" role="alert">
                  {query.error.slice(0, 150)}
                </p>
              )}
              <button className="button">Sign in</button>
            </form>
          )}
        </div>
      </div>
    );
  if (!["products", "orders", "enquiries", "settings"].includes(view))
    notFound();
  if (!supabaseConfigured())
    return (
      <div className="container admin-page">
        <h1>The studio, ready to connect.</h1>
        <p className="admin-note">
          The storefront preview is working. Connect Supabase to enable private
          product, order, enquiry and shipping management.
        </p>
        <div className="admin-links">
          <Link className="button" href="/shop">
            View storefront
          </Link>
          <Link className="button button-outline" href="/admin/login">
            Administrator sign-in
          </Link>
        </div>
        <div className="prose">
          <h2>Prepared for the owner.</h2>
          <p>
            Invited administrator access, product and variant editing, photo
            uploads, order fulfilment updates, private custom enquiries, and
            destination shipping rates are implemented behind authentication.
            They cannot be accessed until the database and policies are
            installed.
          </p>
          <h2>Connection checklist</h2>
          <p>
            Use the project README and .env.example. Apply the reviewed
            migration, load the illustrative seed only in development, configure
            product and enquiry storage, and add the invited user to
            admin_memberships through the trusted dashboard.
          </p>
          <p>
            Payment remains off until real products, shipping, policies and the
            merchant’s international payment acceptance are verified.
          </p>
        </div>
      </div>
    );
  let admin: Awaited<ReturnType<typeof requireAdmin>> | null = null;
  try {
    admin = await requireAdmin();
  } catch {
    /* Redirect below, outside the catch. */
  }
  if (!admin) redirect("/admin/login");
  const { db } = admin;
  let content: React.ReactNode;
  if (view === "products") {
    if (section[1]) {
      let product: Product;
      let published = false;
      if (section[1] === "new")
        product = {
          ...previewProducts[0],
          id: `loc-${crypto.randomUUID().slice(0, 8)}`,
          slug: "new-loc-style",
          name: "New loc style",
          approved: false,
          variants: [
            {
              ...previewProducts[0].variants[0],
              id: `variant-${crypto.randomUUID()}`,
            },
          ],
        };
      else {
        const [p, v] = await Promise.all([
          db.from("products").select("*").eq("id", section[1]).single(),
          db.from("variants").select("*").eq("product_id", section[1]),
        ]);
        if (p.error || !p.data || v.error) notFound();
        published = p.data.published;
        product = {
          ...(p.data.content as Omit<
            Product,
            "id" | "slug" | "name" | "approved" | "variants"
          >),
          id: p.data.id,
          slug: p.data.slug,
          name: p.data.name,
          approved: p.data.approved,
          variants: v.data.map((variant) => ({
            id: variant.id,
            length: variant.length,
            colour: variant.colour,
            priceMinor: variant.price_minor,
            available: variant.available,
          })),
        };
      }
      content = (
        <>
          {query.saved && (
            <p className="admin-note" role="status">
              Product saved.
            </p>
          )}
          <AdminProductForm product={product} published={published} />
        </>
      );
    } else {
      const result = await db
        .from("products")
        .select("id,name,published,approved")
        .order("name");
      if (result.error) throw new Error("Products could not be loaded.");
      content = (
        <>
          <Link className="button" href="/admin/products/new">
            Create product
          </Link>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Visibility</th>
                  <th>Sale approval</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.published ? "Published" : "Draft"}</td>
                    <td>{p.approved ? "Approved" : "Preview only"}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/admin/products/${p.id}`}
                      >
                        Edit product
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result.data.length && (
            <p className="admin-note">
              No products yet. Create your first style.
            </p>
          )}
        </>
      );
    }
  } else if (view === "orders") {
    const result = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (result.error) throw new Error("Orders could not be loaded.");
    content = result.data.length ? (
      result.data.map((order) => (
        <article className="admin-record" key={order.id}>
          <h2>{order.payment_reference}</h2>
          <p>
            {order.email} · {money(order.total_minor)} · payment{" "}
            {order.payment_status}
          </p>
          <p>
            Placed{" "}
            {new Date(order.created_at).toLocaleString("en-GB", {
              timeZone: "Africa/Lagos",
            })}{" "}
            (Lagos)
          </p>
          <details>
            <summary>Customer and order details</summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 11 }}>
              {JSON.stringify(
                { customer: order.customer, items: order.quote },
                null,
                2,
              )}
            </pre>
          </details>
          {order.payment_status === "paid" && (
            <form
              action={updateOrder}
              className="stack"
              style={{ maxWidth: 500 }}
            >
              <input type="hidden" name="id" value={order.id} />
              <label>
                Fulfilment
                <select name="status" defaultValue={order.fulfilment_status}>
                  {[
                    "awaiting-production",
                    "in-production",
                    "ready",
                    "shipped",
                    "delivered",
                  ].map((s) => (
                    <option value={s} key={s}>
                      {s.replaceAll("-", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tracking reference / carrier
                <input
                  name="tracking"
                  defaultValue={order.tracking || ""}
                  maxLength={250}
                />
              </label>
              <button className="button">Update fulfilment</button>
            </form>
          )}
        </article>
      ))
    ) : (
      <p>No orders yet.</p>
    );
  } else if (view === "enquiries") {
    const result = await db
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (result.error) throw new Error("Enquiries could not be loaded.");
    content = result.data.length ? (
      await Promise.all(
        result.data.map(async (enquiry) => {
          const signed = enquiry.attachment_path
            ? await db.storage
                .from("enquiry-references")
                .createSignedUrl(enquiry.attachment_path, 300)
            : null;
          return (
            <article className="admin-record" key={enquiry.id}>
              <h2>{enquiry.name}</h2>
              <p>{enquiry.email}</p>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                {JSON.stringify(enquiry.details, null, 2)}
              </pre>
              {signed?.data && (
                <a
                  href={signed.data.signedUrl}
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open private reference (link expires in 5 minutes)
                </a>
              )}
              <form
                className="stack"
                action={updateEnquiry}
                style={{ maxWidth: 350 }}
              >
                <input type="hidden" name="id" value={enquiry.id} />
                <label>
                  Enquiry status
                  <select name="status" defaultValue={enquiry.status}>
                    {["new", "reviewing", "quoted", "closed"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button className="button">Save status</button>
              </form>
            </article>
          );
        }),
      )
    ) : (
      <p>No custom enquiries yet.</p>
    );
  } else {
    const result = await db
      .from("shipping_destinations")
      .select("*")
      .order("name");
    if (result.error) throw new Error("Shipping settings could not be loaded.");
    const records = [
      ...result.data,
      {
        code: "",
        name: "",
        region_label: "State / region",
        postal_required: true,
        rate_minor: 0,
        transit: "",
        approved: false,
      },
    ];
    content = (
      <>
        <p className="admin-note">
          NGN is the charge currency. International destinations require an
          approved rate and confirmed merchant acceptance. Product-level
          availability controls made-to-order capacity.
        </p>
        {records.map((d, i) => (
          <form
            action={updateShipping}
            key={d.code || "new"}
            className="stack admin-record"
            style={{ maxWidth: 650 }}
          >
            <h2>{d.name || "Add a destination"}</h2>
            <div className="form-row">
              <label>
                Country code (ISO, 2 letters)
                <input
                  name="code"
                  defaultValue={d.code}
                  pattern="[A-Z]{2}"
                  maxLength={2}
                  required
                  readOnly={Boolean(d.code)}
                />
              </label>
              <label>
                Country name
                <input name="name" defaultValue={d.name} required />
              </label>
            </div>
            <div className="form-row">
              <label>
                Shipping price (NGN)
                <input
                  name="rate"
                  defaultValue={(d.rate_minor / 100).toFixed(2)}
                  required
                  inputMode="decimal"
                />
              </label>
              <label>
                Transit estimate
                <input
                  name="transit"
                  defaultValue={d.transit}
                  required
                  placeholder="5–10 business days"
                />
              </label>
            </div>
            <label>
              Address region label
              <input
                name="regionLabel"
                defaultValue={d.region_label}
                required
              />
            </label>
            <label className="checkbox-label">
              <input
                name="postalRequired"
                type="checkbox"
                defaultChecked={d.postal_required}
              />{" "}
              Require a postal code
            </label>
            <label className="checkbox-label">
              <input
                name="approved"
                type="checkbox"
                defaultChecked={d.approved}
              />{" "}
              Rate and destination approved for live orders
            </label>
            <button className="button">
              {i === records.length - 1
                ? "Add destination"
                : "Save destination"}
            </button>
          </form>
        ))}
        {!result.data.length && (
          <p className="small muted">
            No destinations configured. Suggested preview destinations:{" "}
            {previewDestinations.map((d) => d.name).join(", ")}.
          </p>
        )}
      </>
    );
  }
  return (
    <div className="container admin-page">
      <div className="section-heading">
        <h1>The studio.</h1>
        <form action={logout}>
          <button
            className="text-link"
            style={{ background: "none", borderTop: 0, borderInline: 0 }}
          >
            Sign out
          </button>
        </form>
      </div>
      <nav className="admin-nav" aria-label="Studio navigation">
        {["products", "orders", "enquiries", "settings"].map((s) => (
          <Link
            key={s}
            href={`/admin/${s}`}
            aria-current={view === s ? "page" : undefined}
          >
            {s === "settings"
              ? "Shipping settings"
              : s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </nav>
      {content}
    </div>
  );
}
