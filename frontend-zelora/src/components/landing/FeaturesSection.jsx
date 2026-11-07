import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Truck size={28} />,
      title: 'Fast Delivery',
      subtitle: 'Across India',
    },
    {
      icon: <ShieldCheck size={28} />,
      title: 'Secure Payments',
      subtitle: '100% Safe & Trusted',
    },
    {
      icon: <RotateCcw size={28} />,
      title: 'Easy Returns',
      subtitle: 'Hassle-Free',
    },
    {
      icon: <Headphones size={28} />,
      title: 'Customer Support',
      subtitle: 'Always Here to Help',
    },
  ];

  return (
    <section className="zelora-features">
      <div className="zelora-features-container">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-item">
            <div className="feature-icon-box" aria-hidden="true">
              {feature.icon}
            </div>
            <div className="feature-text">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-subtitle">{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

