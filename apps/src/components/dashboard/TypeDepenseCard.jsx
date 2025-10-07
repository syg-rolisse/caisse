import { memo } from 'react'
import PropTypes from 'prop-types'
import { ReceiptText, ArrowRightLeft, MoreHorizontal, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Un composant interne pour animer un nombre de manière fluide.
 * Framer Motion animera automatiquement le changement de la prop `count`.
 */
const AnimatedNumber = ({ value }) => {
  return (
    <motion.p
      // La transition est définie ici : durée, type d'animation (ease)
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="tw-text-lg tw-font-semibold tw-text-gray-800"
    >
      {/* On formate la valeur pour l'affichage */}
      {value.toLocaleString()} F
    </motion.p>
  )
}

AnimatedNumber.propTypes = {
  value: PropTypes.number.isRequired,
}

const TypeDepenseCard = ({ typeDepense }) => {
  const { totalDepense = 0, totalMouvement = 0, wording } = typeDepense

  return (
    <div className="tw-bg-white tw-p-5 tw-rounded-xl tw-border tw-border-gray-200 tw-transition-all hover:tw-shadow-lg hover:tw-border-orange-500">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <div className="tw-p-2 tw-bg-gray-100 tw-rounded-lg">
          <Tag className="tw-w-5 tw-h-5 tw-text-gray-600" />
        </div>
        <button className="tw-text-gray-400 hover:tw-text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Animation sur le wording : un simple fondu est plus subtil */}
      <AnimatePresence mode="wait">
        <motion.h4
          key={wording}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="tw-font-bold tw-text-gray-800 tw-truncate"
          title={wording}
        >
          {wording}
        </motion.h4>
      </AnimatePresence>

      <div className="tw-mt-5 tw-space-y-4">
        {/* Total Dépensé */}
        <div className="tw-flex tw-items-start">
          <ReceiptText className="tw-w-5 tw-h-5 tw-text-red-500 tw-mr-3 tw-flex-shrink-0" />
          <div>
            <p className="tw-text-sm tw-text-gray-500">Total Dépensé</p>
            {/* On passe la valeur numérique au composant d'animation */}
            <AnimatedNumber value={totalDepense} />
          </div>
        </div>

        {/* Total Mouvements */}
        <div className="tw-flex tw-items-start">
          <ArrowRightLeft className="tw-w-5 tw-h-5 tw-text-blue-500 tw-mr-3 tw-flex-shrink-0" />
          <div>
            <p className="tw-text-sm tw-text-gray-500">Total Mouvements</p>
            {/* On passe la valeur numérique au composant d'animation */}
            <AnimatedNumber value={totalMouvement} />
          </div>
        </div>
      </div>
    </div>
  )
}

TypeDepenseCard.propTypes = {
  typeDepense: PropTypes.shape({
    id: PropTypes.number.isRequired,
    wording: PropTypes.string.isRequired,
    totalDepense: PropTypes.number,
    totalMouvement: PropTypes.number,
  }).isRequired,
}

export default memo(TypeDepenseCard)