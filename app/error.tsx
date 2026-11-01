"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container error-page">
      <h1>A little pause.</h1>
      <p>We couldn’t load this part of the store. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
