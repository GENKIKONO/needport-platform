export default function Analytics() {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!plausible) return null;
  return (
    <script
      defer
      data-domain={plausible}
      src="https://plausible.io/js/script.js"
    />
  );
}
