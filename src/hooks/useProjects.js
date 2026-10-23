// src/hooks/useProjects.js
import { useCallback, useEffect, useState } from "react";
import { ZeroAddress } from "ethers";
import { useWallet } from "../context/WalletContext";
import { STATUS } from "../contract";

export default function useProjects() {
  const { contract } = useWallet();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState(null);

  const reload = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const [count, maxApplicants, maxRejects, maxActive, medium, large, depositBps, ttl] =
        await Promise.all([
          contract.projectCounter(),
          contract.MAX_APPLICANTS(),
          contract.MAX_REJECTS(),
          contract.MAX_ACTIVE_PROJECTS(),
          contract.MEDIUM_STAKE(),
          contract.LARGE_STAKE(),
          contract.DEPOSIT_BPS(),
          contract.AUTO_APPROVE_TTL(),
        ]);
      setLimits({
        maxApplicants: Number(maxApplicants),
        maxRejects: Number(maxRejects),
        maxActive: Number(maxActive),
        mediumStake: medium,
        largeStake: large,
        depositBps: Number(depositBps),
        autoApproveTtl: Number(ttl),
      });

      // ids may start at 0 or 1, so try 0..count and skip empty slots
      const ids = Array.from({ length: Number(count) + 1 }, (_, i) => i);
      const raw = await Promise.all(ids.map((id) => contract.projects(id).catch(() => null)));
      const list = raw
        .map((p, id) =>
          p && p.client !== ZeroAddress
            ? {
                id,
                client: p.client,
                freelancer: p.freelancer,
                type: Number(p.projectType),
                status: Number(p.status),
                contractAmount: p.contractAmount,
                escrow: p.escrow,
                deadline: Number(p.deadline),
                submissionTime: Number(p.submissionTime),
                rejectCount: Number(p.rejectCount),
                applicants: [],
                countdown: null,
              }
            : null
        )
        .filter(Boolean);

      await Promise.all(
        list.map(async (p) => {
          if (p.status === STATUS.OPEN) p.applicants = [...(await contract.getApplicants(p.id))];
          if (p.status === STATUS.SUBMITTED)
            p.countdown = Number(await contract.autoApprovalCountdown(p.id).catch(() => 0n));
        })
      );
      setProjects(list.reverse()); // newest first
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => { reload(); }, [reload]);

  return { projects, limits, loading, reload };
}