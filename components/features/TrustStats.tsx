import React from "react";
import { Briefcase, Clock, Star, Users } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    value: "340+",
    label: "Medical Practices Served",
  },
  {
    icon: Clock,
    value: "14+",
    label: "Years Healthcare Law Experience",
  },
  {
    icon: Star,
    value: "98%",
    label: "Client Satisfaction Rate",
  },
  {
    icon: Users,
    value: "24hr",
    label: "Average Response Time",
  },
];

const TrustStats: React.FC = () => (
  <section className="py-12 bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
    <div className="container-custom">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Trusted by Healthcare Professionals
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="text-center p-4 bg-white/40 dark:bg-slate-800/60 rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm"
            >
              <div className="w-12 h-12 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-tiffany" />
              </div>
              <div className="text-3xl font-bold text-tiffany mb-1">{value}</div>
              <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustStats;
