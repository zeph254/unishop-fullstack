export default function NoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <img
        src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
        alt="404 Not Found"
        className="w-96 h-auto"
      />
      <h2 className="text-2xl font-bold text-gray-700 mt-4">Oops! Page not found.</h2>
      <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
      <a href="/" className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
        Go Home
      </a>
    </div>
  );
}

