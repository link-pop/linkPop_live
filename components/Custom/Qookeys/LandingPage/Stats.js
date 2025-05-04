import Counter from "../../animata/text/counter";

export default function Stats() {
  return (
    <div className="w-full py-12 bg-white">
      <div className="container px-4 md:px-6 mx-auto flex items-center justify-center">
        <div className="afade22 f jcc md:divide-x divide-gray-200 text-center mx-auto">
          <div className="px-12 pt15 sm:pt0 w270">
            <div className="space-y-2">
              <h3 className="fz40 sm:fz60 black text-4xl font-bold tracking-tighter sm:text-5xl">
                <Counter targetValue={100} />
                <span className="afade22">k+</span>
              </h3>
              <p className="afade22 text-gray-500 dark:text-gray-400">
                Cups of coffee
              </p>
            </div>
          </div>

          <div className="px-12 pt15 sm:pt0 w270">
            <div className="space-y-2">
              <h3 className="fz40 sm:fz60 black text-4xl font-bold tracking-tighter sm:text-5xl">
                <Counter targetValue={1000} />
                <span className="afade22">+</span>
              </h3>
              <p className="afade22 text-gray-500 dark:text-gray-400">Orders</p>
            </div>
          </div>

          <div className="px-12 pt15 sm:pt0 w270">
            <div className="space-y-2">
              <h3 className="fz40 sm:fz60 black text-4xl font-bold tracking-tighter sm:text-5xl">
                <Counter targetValue={100} />
                <span className="afade22">%</span>
              </h3>
              <p className="afade22 text-gray-500 dark:text-gray-400">
                Support
              </p>
            </div>
          </div>

          <div className="px-12 pt15 sm:pt0 w270">
            <div className="space-y-2">
              <h3 className="fz40 sm:fz60 black text-4xl font-bold tracking-tighter sm:text-5xl">
                <Counter targetValue={300} />
                <span className="afade22">+</span>
              </h3>
              <p className="afade22 text-gray-500 dark:text-gray-400">
                Happy Customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
