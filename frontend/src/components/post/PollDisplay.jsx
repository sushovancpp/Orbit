import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function PollDisplay({ poll, postId }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
  const isExpired = new Date() > new Date(poll.expiresAt);
  const userVote = poll.options.findIndex(o => o.votes?.includes(user?._id));
  const hasVoted = userVote >= 0;

  const mutation = useMutation({
    mutationFn: (optionIndex) => api.post(`/posts/${postId}/poll/vote`, { optionIndex }),
    onSuccess: () => qc.invalidateQueries(['feed']),
  });

  return (
    <div className="px-4 pb-3 space-y-2">
      <p className="font-medium text-sm">{poll.question}</p>
      {poll.options.map((option, i) => {
        const pct = totalVotes ? Math.round((option.votes?.length || 0) / totalVotes * 100) : 0;
        const isChosen = userVote === i;
        return (
          <button
            key={i}
            onClick={() => !hasVoted && !isExpired && mutation.mutate(i)}
            disabled={hasVoted || isExpired}
            className="w-full text-left relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 transition-all hover:border-orbit-400 disabled:cursor-default"
          >
            {hasVoted && (
              <div
                className={`absolute inset-y-0 left-0 ${isChosen ? 'bg-orbit-100 dark:bg-orbit-900/30' : 'bg-gray-100 dark:bg-gray-800'} transition-all`}
                style={{ width: `${pct}%` }}
              />
            )}
            <div className="relative flex items-center justify-between px-3 py-2 text-sm">
              <span className={`font-medium ${isChosen ? 'text-orbit-600' : ''}`}>{option.text}</span>
              {hasVoted && <span className="text-gray-500 text-xs">{pct}%</span>}
            </div>
          </button>
        );
      })}
      <p className="text-xs text-gray-400">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} · {isExpired ? 'Poll ended' : `Ends ${new Date(poll.expiresAt).toLocaleDateString()}`}
      </p>
    </div>
  );
}
