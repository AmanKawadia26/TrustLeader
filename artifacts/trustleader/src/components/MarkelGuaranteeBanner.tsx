import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export function MarkelGuaranteeBanner() {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-900 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm"
    >
      <div className="bg-green-100 dark:bg-green-900/50 p-2.5 rounded-full shrink-0">
        <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
          {t('business.insurance')}
          <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Verified
          </span>
        </h4>
        <p className="text-sm text-green-700/80 dark:text-green-300/80 mt-0.5">
          {t('business.insurance.desc')}
        </p>
      </div>
    </motion.div>
  );
}
