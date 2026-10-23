// src/contract/index.js
export const CONTRACT_ADDRESS = "0x7CF7dB63d6CBF3EBA38FDA0f3FA25a5e5c13Ba2A";
export const SEPOLIA = { chainId: 11155111, hex: "0xaa36a7", name: "Sepolia" };

// Human-readable ABI (ethers v6 understands this directly)
export const ABI = [
  "function applyForProject(uint256 id)",
  "function approveWork(uint256 id)",
  "function cancelOpenProject(uint256 id)",
  "function claimAutoApproval(uint256 id)",
  "function claimMissedDeadline(uint256 id)",
  "function createProject(uint8 pType, uint256 contractAmount, uint256 deadline) payable returns (uint256 projectId)",
  "function depositStake() payable",
  "function rejectWork(uint256 id)",
  "function selectFreelancer(uint256 id, address freelancer)",
  "function submitWork(uint256 id)",
  "function withdrawStake(uint256 amount)",
  "function applicantCount(uint256 id) view returns (uint256)",
  "function AUTO_APPROVE_TTL() view returns (uint256)",
  "function autoApprovalCountdown(uint256 id) view returns (uint256)",
  "function calculateDeposit(uint256 contractAmount) pure returns (uint256)",
  "function DEPOSIT_BPS() view returns (uint256)",
  "function getApplicants(uint256 id) view returns (address[])",
  "function hasApplied(uint256, address) view returns (bool)",
  "function LARGE_STAKE() view returns (uint256)",
  "function MAX_ACTIVE_PROJECTS() view returns (uint256)",
  "function MAX_APPLICANTS() view returns (uint256)",
  "function MAX_REJECTS() view returns (uint256)",
  "function MEDIUM_STAKE() view returns (uint256)",
  "function meetsStakeRequirement(address freelancer, uint8 pType) view returns (bool)",
  "function profiles(address) view returns (uint256 stakedAmount, uint256 completedCount, uint256 cancelledCount)",
  "function projectCounter() view returns (uint256)",
  "function projects(uint256) view returns (address client, address freelancer, uint8 projectType, uint8 status, uint256 contractAmount, uint256 escrow, uint256 deadline, uint256 submissionTime, uint256 rejectCount)",
];

/* ------------------------------------------------------------------ *
 * The ABI only exposes enums as numbers. These labels are ASSUMPTIONS.
 * Open the Solidity source and make the order match your enums.
 * ------------------------------------------------------------------ */
export const PROJECT_TYPES = ["Small", "Medium", "Large"];

export const STATUS = {
  OPEN: 0,
  IN_PROGRESS: 1,
  SUBMITTED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  FAILED: 5,
};
export const STATUS_LABELS = ["Open", "In progress", "Submitted", "Completed", "Cancelled", "Missed deadline"];

// Is `deadline` in createProject an absolute unix timestamp or a duration in seconds?
// "timestamp" | "duration"
export const DEADLINE_MODE = "timestamp";