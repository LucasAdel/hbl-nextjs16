import React from "react";

interface TestimonialProps {
  quote: string;
  name: string;
  location: string;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ quote, name, location }) => {
  return (
    <div
      className="h-full flex flex-col bg-white/80 rounded-2xl p-8 border border-gray-200/50"
      style={{
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
      }}
    >
      {/* Quote Icon */}
      <svg
        className="mb-6 text-tiffany-light"
        style={{ width: "40px", height: "40px" }}
        fill="currentColor"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 8v8H6v-8h4m12 0v8h-4v-8h4M14 20c0 1.1-0.9 2-2 2H8c-1.1 0-2-0.9-2-2v-4h4v4h4v-4h4v4zm12 0c0 1.1-0.9 2-2 2h-4c-1.1 0-2-0.9-2-2v-4h4v4h4v-4h4v4z" />
      </svg>

      {/* Quote Text */}
      <p className="flex-grow font-montserrat text-base leading-relaxed text-text-secondary mb-6">
        {quote}
      </p>

      {/* Attribution */}
      <div>
        <p className="font-montserrat text-base font-semibold text-text-primary mb-1">{name}</p>
        <p className="font-montserrat text-sm font-medium text-tiffany">{location}</p>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote:
        "Hamilton Bailey has been instrumental in helping us navigate the complex legal landscape of medical practice in Australia. Their expertise saved us countless hours and potential issues.",
      name: "Dr. Sarah",
      location: "Melbourne",
    },
    {
      quote:
        "The team at Hamilton Bailey provided comprehensive legal support when we were establishing our new practice. Their attention to detail and knowledge of healthcare regulations was impressive.",
      name: "Dr. James",
      location: "Sydney",
    },
    {
      quote:
        "The legal documents we purchased were precisely tailored to our specific needs as medical practitioners. Worth every cent for the peace of mind they provide.",
      name: "Dr. Emma",
      location: "Brisbane",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider block mb-3">
            Client Experiences
          </span>
          <h2 className="font-blair text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Trusted by Medical Professionals
          </h2>
          <p className="font-montserrat text-lg text-text-secondary max-w-2xl mx-auto">
            Hear from Australian medical practitioners who have benefited from our specialised
            legal services.
          </p>
        </div>

        {/* Testimonials Grid - 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              location={testimonial.location}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
