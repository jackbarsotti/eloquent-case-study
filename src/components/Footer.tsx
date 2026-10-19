export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-50 p-4">
      <div className="flex items-center">
        <a
          href="https://www.eloquentai.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-70"
        >
          <img src="/eloquent-ai-logo.png" alt="Eloquent AI" className="h-8 object-contain" />
        </a>
      </div>
    </footer>
  );
}
