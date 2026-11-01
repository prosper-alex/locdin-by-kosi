import type { Product } from "@/lib/types";
import { saveProduct } from "@/app/admin/actions";
import { collections } from "@/data/catalogue";
export function AdminProductForm({
  product,
  published,
}: {
  product: Product;
  published: boolean;
}) {
  return (
    <form action={saveProduct} className="stack admin-editor">
      <input type="hidden" name="id" value={product.id} />
      <div className="form-row">
        <label>
          Product name
          <input name="name" defaultValue={product.name} required />
        </label>
        <label>
          URL slug
          <input
            name="slug"
            defaultValue={product.slug}
            required
            pattern="[a-z0-9-]+"
          />
        </label>
      </div>
      <label>
        Collection
        <select name="collection" defaultValue={product.collection}>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Description
        <textarea
          name="description"
          defaultValue={product.description}
          required
          style={{ minHeight: 100, fontFamily: "inherit" }}
        />
      </label>
      <div className="form-row">
        <label>
          Short detail
          <input name="detail" defaultValue={product.detail} required />
        </label>
        <label>
          Material
          <input name="material" defaultValue={product.material} required />
        </label>
      </div>
      <div className="form-row">
        <label>
          Locs per bundle
          <input
            type="number"
            name="locsPerBundle"
            defaultValue={product.locsPerBundle}
            min={1}
            max={1000}
            required
          />
        </label>
        <label>
          Production estimate
          <input name="leadTime" defaultValue={product.leadTime} required />
        </label>
      </div>
      <label>
        Current image
        <input name="image" defaultValue={product.image} required />
      </label>
      <label>
        Replace with a product photo
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        <span className="file-help">JPEG, PNG or WebP, up to 4 MB.</span>
      </label>
      <label>
        Image description
        <input name="imageAlt" defaultValue={product.imageAlt} required />
      </label>
      <h2>Sellable variants</h2>
      <p className="small muted">
        Prices are NGN per bundle. Disable combinations that cannot be
        fulfilled. Launch inventory is made to order.
      </p>
      {product.variants.map((v, index) => (
        <div className="admin-record" key={v.id}>
          <input type="hidden" name="variantId" value={v.id} />
          <div className="form-row">
            <label>
              Length (inches)
              <input
                name={`length-${index}`}
                type="number"
                defaultValue={v.length}
                required
                min={1}
                max={100}
              />
            </label>
            <label>
              Colour
              <input
                name={`colour-${index}`}
                defaultValue={v.colour}
                required
              />
            </label>
          </div>
          <label style={{ marginTop: 15 }}>
            Price per bundle (NGN)
            <input
              name={`price-${index}`}
              inputMode="decimal"
              defaultValue={(v.priceMinor / 100).toFixed(2)}
              required
            />
          </label>
          <label className="checkbox-label" style={{ marginTop: 15 }}>
            <input
              name={`available-${index}`}
              type="checkbox"
              defaultChecked={v.available}
            />{" "}
            Available to order
          </label>
        </div>
      ))}
      <label className="checkbox-label">
        <input type="checkbox" name="published" defaultChecked={published} />{" "}
        Show in the catalogue
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="approved"
          defaultChecked={product.approved}
        />{" "}
        I have verified this product’s photography, specifications, pricing,
        bundle quantity, and production estimate for live sale.
      </label>
      <button className="button" type="submit">
        Save product
      </button>
    </form>
  );
}
