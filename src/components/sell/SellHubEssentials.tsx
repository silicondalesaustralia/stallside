import Image from "next/image";
import Link from "next/link";

export default function SellHubEssentials() {
  return (
    <section className="section pale">
      <div className="wrap">
        <h2 className="serif">Different products. The same business essentials.</h2>
        <div className="three">
          <article>
            <div className="visual">
              <div className="browser-bar">
                <span className="dots">•••</span>
                <span className="demo-label">Illustrative shop concept</span>
              </div>
              <div className="mini-store">
                <div className="store-title">EMBER &amp; EARTH</div>
                <div className="store-nav">Shop Collections About</div>
                <div className="shop-products">
                  {["Forest Amber", "Vanilla Grove", "Cedar & Fig"].map((name) => (
                    <div key={name} className="store-product">
                      <Image
                        src="/sell/assets/candles.jpg"
                        alt="Illustrative candle photography"
                        width={200}
                        height={160}
                      />
                      <p>
                        {name}
                        <br />
                        $18.00
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <h3>A place to sell</h3>
            <p>
              Start with a Free shop link. Give your brand its own website and domain with
              Pro.
            </p>
          </article>
          <article>
            <div className="visual cost-mini">
              <span className="badge">Pro · illustrative example</span>
              <div className="cost-row">
                <span>Materials</span>
                <b>$12.40</b>
              </div>
              <div className="cost-row">
                <span>Labour</span>
                <b>$8.00</b>
              </div>
              <div className="cost-row">
                <span>Overheads</span>
                <b>$2.50</b>
              </div>
              <div className="cost-row">
                <span>Packaging</span>
                <b>$1.20</b>
              </div>
              <div className="cost-total">
                <span>Cost per unit</span>
                <span>$24.10</span>
              </div>
            </div>
            <h3>Know what it costs</h3>
            <p>
              Bring materials, labour and packaging together so you can price with
              confidence.
            </p>
          </article>
          <article>
            <div className="visual">
              <Image
                src="/sell/assets/candles.jpg"
                alt="Candle product photography"
                width={480}
                height={320}
              />
            </div>
            <h3>Keep customers coming back</h3>
            <p>
              Share what you make and stay in touch. Email with Pro; social and video use
              credits.
            </p>
          </article>
        </div>
        <div className="center space-top">
          <Link className="btn outline" href="/#platform">
            Explore the platform
          </Link>
        </div>
      </div>
    </section>
  );
}
