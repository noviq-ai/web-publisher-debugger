import { motion } from 'framer-motion'

interface AssistantLoaderProps {
  size: number
}

type Ray = readonly [x1: number, y1: number, x2: number, y2: number]

const RAYS: readonly Ray[] = [
  [77.6085, 53.5275, 77.6085, 18.1653],
  [77.6085, 101.473, 77.6085, 136.835],
  [101.473, 77.6085, 136.835, 77.6085],
  [53.5275, 77.6085, 18.1653, 77.6085],
  [94.3133, 94.5302, 119.045, 119.913],
  [60.6867, 60.4697, 35.9548, 35.304],
  [94.5302, 60.6867, 119.913, 35.9548],
  [60.4697, 94.3133, 35.304, 119.045],
  [86.7573, 55.3867, 100.265, 22.706],
  [68.4434, 99.6962, 54.9358, 132.377],
  [99.6134, 86.7572, 132.294, 100.265],
  [55.3039, 68.4433, 22.6232, 54.9357],
  [86.5333, 99.6612, 99.6941, 132.566],
  [68.4669, 55.3388, 55.2232, 22.6343],
  [99.6613, 68.4668, 132.566, 55.3059],
  [55.3389, 86.5332, 22.6344, 99.7769],
]

export const AssistantLoader: React.FC<AssistantLoaderProps> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 155 155"
    fill="none"
    aria-hidden="true"
  >
    {RAYS.map(([x1, y1, x2, y2], index) => (
      <motion.line
        key={`${x1}-${y1}-${x2}-${y2}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0.35, opacity: 0.35 }}
        animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.35, 1, 0.35] }}
        transition={{
          duration: 1.4,
          delay: index * 0.055,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
    ))}
  </svg>
)
