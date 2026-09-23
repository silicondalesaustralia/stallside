"use client";

import { useEffect, useState, useTransition } from "react";
import CommunicationListMemberPicker from "./CommunicationListMemberPicker";
import { loadListMembers } from "../list-members";

type ListOpt = { id: string; name: string };
type Member = { email: string };

export default function CommunicationListAudience({
  lists,
  listId,
  onListIdChange,
  initialMembers,
}: {
  lists: ListOpt[];
  listId: string;
  onListIdChange: (id: string) => void;
  initialMembers: Member[];
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [selectedEmails, setSelectedEmails] = useState<string[]>(() =>
    initialMembers.map((m) => m.email),
  );
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    if (!listId) {
      setMembers([]);
      setSelectedEmails([]);
      return;
    }
    let cancelled = false;
    startLoad(async () => {
      const result = await loadListMembers(listId);
      if (cancelled) return;
      const next = result.members ?? [];
      setMembers(next);
      setSelectedEmails(next.map((m) => m.email));
    });
    return () => {
      cancelled = true;
    };
  }, [listId]);

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">List</span>
        <select
          name="listId"
          required
          value={listId}
          onChange={(e) => onListIdChange(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        >
          <option value="">Select list…</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      {listId ? (
        <CommunicationListMemberPicker
          members={members}
          selected={selectedEmails}
          onChange={setSelectedEmails}
          loading={loading}
        />
      ) : null}
    </>
  );
}
