/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ErrorCode {
  code: string;
  title: string;
  description: string;
  causes: string[];
  solutions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const CANON_ERROR_CODES: ErrorCode[] = [
  {
    code: "E000",
    title: "Fixing Assembly Temperature Error",
    description: "The temperature of the fixing assembly does not rise to a specified level.",
    causes: [
      "Faulty fixing heater",
      "Faulty thermistor",
      "Faulty DC controller PCB",
      "Blown thermal fuse"
    ],
    solutions: [
      "Check the continuity of the fixing heater.",
      "Check the resistance of the thermistor.",
      "Replace the fixing assembly.",
      "Reset the error in Service Mode (COPIER > FUNCTION > CLEAR > ERR)."
    ],
    severity: "high"
  },
  {
    code: "E001",
    title: "Fixing Assembly Overheating",
    description: "The temperature of the fixing assembly has risen abnormally.",
    causes: [
      "Faulty thermistor",
      "Faulty DC controller PCB",
      "Fixing heater control circuit failure"
    ],
    solutions: [
      "Check the thermistor for proper contact.",
      "Replace the fixing assembly.",
      "Replace the DC controller PCB."
    ],
    severity: "critical"
  },
  {
    code: "E002",
    title: "Fixing Temperature Rise Error",
    description: "The temperature of the fixing assembly does not reach a specified level within a specified time.",
    causes: [
      "Faulty fixing heater",
      "Faulty thermistor",
      "Poor contact in the fixing assembly connector"
    ],
    solutions: [
      "Check the fixing heater and thermistor.",
      "Check the connector for any bent pins or poor contact.",
      "Replace the fixing assembly."
    ],
    severity: "high"
  },
  {
    code: "E110",
    title: "Scanner Motor Error",
    description: "The scanner motor does not rotate at a specified speed.",
    causes: [
      "Faulty scanner motor",
      "Faulty motor driver PCB",
      "Mechanical obstruction in the scanner unit"
    ],
    solutions: [
      "Check if the scanner unit moves freely.",
      "Check the wiring between the motor and the driver PCB.",
      "Replace the scanner motor."
    ],
    severity: "medium"
  },
  {
    code: "E202",
    title: "CIS Home Position Detection Error",
    description: "The CIS (Contact Image Sensor) cannot detect the home position.",
    causes: [
      "Faulty CIS unit",
      "Faulty scanner motor",
      "Dirty home position sensor or white strip"
    ],
    solutions: [
      "Clean the white strip and the CIS glass.",
      "Check the scanner motor operation.",
      "Replace the CIS unit."
    ],
    severity: "medium"
  },
  {
    code: "5200",
    title: "Print Head Overheating (Inkjet)",
    description: "The print head temperature has exceeded the limit.",
    causes: [
      "Empty ink cartridges causing dry firing",
      "Faulty print head",
      "Logic board failure"
    ],
    solutions: [
      "Check ink levels and replace empty cartridges.",
      "Perform a print head cleaning.",
      "Replace the print head if the error persists."
    ],
    severity: "high"
  },
  {
    code: "B200",
    title: "VH Voltage Error (Inkjet)",
    description: "Abnormal voltage detected in the print head.",
    causes: [
      "Short circuit in the print head",
      "Faulty power supply",
      "Logic board failure"
    ],
    solutions: [
      "Unplug the printer and leave it for 30 minutes.",
      "Remove the print head and check for ink leaks or burns.",
      "Replace the print head or the printer."
    ],
    severity: "critical"
  }
];
