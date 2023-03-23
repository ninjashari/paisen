export default function Register() {
  return (
    <div className="relative flex justify-center md:px-12 lg:px-0">
      {/* Sign Up Form */}

      <div className="mx-auto w-full max-w-md sm:px-4 ms:w-96 md:max-w-sm md:px-0">
        <div className="flex flex-col">
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">
              Authorize app for MAL API
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Already registered?{" "}
              <a
                className="font-medium text-blue-600 hover:underline"
                href="/login"
              >
                Sign in
              </a>{" "}
              to your account.
            </p>
          </div>
        </div>
        <form
          action="#"
          className="mt-10 grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2"
        >
          <div className="col-span-full">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              className="block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="col-span-full">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="col-span-full">
            <button
              className="group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600 w-full"
              type="submit"
            >
              <span>
                Authorize and Register <span aria-hidden="true">→</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
