import { setCors } from '../_lib/helpers.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transportMethod = 'train', hasAccessibleNeeds = false, preferredGate } = req.body || {};

  const gateRecommendations = {
    train:   ['AMEX Gate', 'Verizon Gate', "Moody's Gate"],
    bus:     ['HCLTech Gate', 'MetLife Gate'],
    parking: preferredGate ? [preferredGate] : ['Platinum Lot Exit', 'Green Lot Exit'],
    uber:    ['Verizon Gate', 'MetLife Gate'],
  };

  const stepsMap = {
    train: [
      `Exit via one of these recommended gates: ${gateRecommendations.train.join(', ')}`,
      'Follow signs to Meadowlands Rail Line station',
      'Take the special event train directly to Secaucus Junction',
      'From Secaucus Junction, connect to your final destination',
    ],
    bus: [
      `Exit via one of these recommended gates: ${gateRecommendations.bus.join(', ')}`,
      'Proceed to designated bus pick-up zones',
      'Board NJ Transit Route 703 or Coach USA 351 Meadowlands Express',
    ],
    parking: [
      'Wait 10–15 minutes to avoid the initial exit surge',
      `Use ${preferredGate || 'your assigned lot exit'} for less congestion`,
      "Follow parking lot attendants' directions",
    ],
    uber: [
      `Exit via one of these recommended gates: ${gateRecommendations.uber.join(', ')}`,
      'Proceed to designated Uber/Lyft pick-up lot on-site',
    ],
  };

  let steps = stepsMap[transportMethod] || [
    'Exit via the nearest available gate',
    'Follow stadium staff directions',
  ];

  if (hasAccessibleNeeds) {
    steps = [
      "Use elevators at HCLTech Gate, Verizon Gate, or Moody's Gate",
      ...steps,
      'Ask any Accessibility Assistant for help if needed',
    ];
  }

  const result = {
    title: `Personalized Exit Plan (${transportMethod})`,
    transportMethod,
    recommendedGates: gateRecommendations[transportMethod] || ['Verizon Gate'],
    steps,
    generatedAt: new Date().toISOString(),
  };

  res.json({ success: true, result, data: result });
}
