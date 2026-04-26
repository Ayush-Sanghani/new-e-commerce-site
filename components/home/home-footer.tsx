export function HomeFooter() {
  return (
    <footer className="mt-12 border-t border-neutral-200 bg-white">
      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">DummyMart</h3>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Fresh products delivered to your doorstep. Built for fast shopping,
            secure payments, and smooth checkout experience.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-slate-800">About Us</a></li>
            <li><a href="#" className="hover:text-slate-800">Careers</a></li>
            <li><a href="#" className="hover:text-slate-800">Blog</a></li>
            <li><a href="#" className="hover:text-slate-800">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900">Customer</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-slate-800">My Account</a></li>
            <li><a href="#" className="hover:text-slate-800">Track Order</a></li>
            <li><a href="#" className="hover:text-slate-800">Wishlist</a></li>
            <li><a href="#" className="hover:text-slate-800">Returns & Refunds</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-900">Contact Info</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>2147 Main Street, New York, NY 10001</li>
            <li>support@dummymart.com</li>
            <li>+1 (800) 123-4567</li>
            <li>Mon - Sat: 9:00 AM - 8:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} DummyMart. All rights reserved.</p>
          <p>Privacy Policy • Terms & Conditions • Shipping Policy</p>
        </div>
      </div>
    </footer>
  );
}
