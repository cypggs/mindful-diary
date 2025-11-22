'use client';

import { useState, useEffect } from 'react';
import { supabase, APIToken } from '@/lib/supabase';

interface TokenManagerProps {
  onClose: () => void;
}

export default function TokenManager({ onClose }: TokenManagerProps) {
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [showNewTokenDialog, setShowNewTokenDialog] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch('/api/tokens', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      setTokens(result.data || []);
    }
    setLoading(false);
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) return;

    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name: newTokenName.trim() }),
    });

    if (response.ok) {
      const result = await response.json();
      setNewlyCreatedToken(result.data.token);
      setShowNewTokenDialog(true);
      setNewTokenName('');
      fetchTokens();
    }
    setCreating(false);
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm('确定要删除这个 API Token 吗？删除后将无法恢复。')) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`/api/tokens/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (response.ok) {
      fetchTokens();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Token 已复制到剪贴板！');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-1.5 bg-gradient-to-r from-diary-400 via-orange-400 to-amber-400"></div>
        <div className="p-6 border-b border-diary-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-diary-900 flex items-center gap-2">
                🔑 API Token 管理
              </h2>
              <p className="text-diary-600 text-sm mt-1">
                创建和管理用于 API 和 MCP 的访问令牌
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-diary-400 hover:text-diary-600 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create new token */}
          <div className="mb-6">
            <label className="block text-diary-700 font-medium mb-2 flex items-center gap-2">
              <span>✨</span>
              <span>创建新 Token</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateToken()}
                placeholder="Token 名称（如：MCP、Claude Desktop、API）"
                className="
                  flex-1 px-4 py-3
                  bg-diary-50 border border-diary-200
                  rounded-xl
                  text-diary-900 placeholder:text-diary-400
                  focus:outline-none focus:ring-2 focus:ring-diary-400/50 focus:border-diary-400
                  transition-all duration-300
                "
              />
              <button
                onClick={handleCreateToken}
                disabled={!newTokenName.trim() || creating}
                className="
                  px-6 py-3
                  bg-gradient-to-r from-diary-500 to-orange-500
                  hover:from-diary-600 hover:to-orange-600
                  text-white font-semibold
                  rounded-xl
                  shadow-lg shadow-diary-300/50 hover:shadow-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                  hover:-translate-y-0.5 active:translate-y-0
                "
              >
                {creating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>

          {/* Token list */}
          <div>
            <h3 className="text-diary-700 font-medium mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>现有 Tokens</span>
            </h3>
            {loading ? (
              <div className="text-center py-8 text-diary-500">加载中...</div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8 text-diary-500">
                还没有创建任何 Token
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="
                      bg-diary-50 border border-diary-200
                      rounded-xl p-4
                      hover:shadow-md
                      transition-all duration-300
                    "
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-diary-900 mb-1">
                          {token.name}
                        </div>
                        <div className="text-xs text-diary-500 space-y-1">
                          <div>创建时间: {formatDate(token.created_at)}</div>
                          {token.last_used_at && (
                            <div>最后使用: {formatDate(token.last_used_at)}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteToken(token.id)}
                        className="
                          p-2 rounded-lg
                          text-diary-400 hover:text-red-500 hover:bg-red-50
                          transition-all duration-200
                        "
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Usage instructions */}
        <div className="p-6 bg-diary-50 border-t border-diary-100">
          <h4 className="text-diary-800 font-medium mb-2 flex items-center gap-2">
            <span>📖</span>
            <span>使用说明</span>
          </h4>
          <div className="text-sm text-diary-600 space-y-2">
            <div>
              <strong>API 使用：</strong>
              <code className="block mt-1 p-2 bg-white rounded text-xs">
                curl -X POST https://riji.cypggs.com/api/diary/create \<br/>
                {'  '}-H "Authorization: Bearer YOUR_TOKEN" \<br/>
                {'  '}-H "Content-Type: application/json" \<br/>
                {'  '}-d '{'{"content":"今天很开心","mood":"happy"}'}'
              </code>
            </div>
            <div>
              <strong>MCP 使用：</strong>在 Claude Desktop 配置文件中添加 MCP 服务器配置
            </div>
          </div>
        </div>
      </div>

      {/* New token created dialog */}
      {showNewTokenDialog && newlyCreatedToken && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-diary-900 mb-4 flex items-center gap-2">
              <span>🎉</span>
              <span>Token 创建成功！</span>
            </h3>
            <div className="mb-4">
              <p className="text-diary-600 text-sm mb-3">
                请复制并保存此 Token，关闭后将无法再次查看：
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={newlyCreatedToken}
                  readOnly
                  className="
                    w-full px-4 py-3 pr-12
                    bg-diary-50 border border-diary-200
                    rounded-xl
                    text-diary-900 font-mono text-sm
                    focus:outline-none
                  "
                />
                <button
                  onClick={() => copyToClipboard(newlyCreatedToken)}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    px-3 py-1.5
                    bg-diary-500 hover:bg-diary-600
                    text-white text-sm font-medium
                    rounded-lg
                    transition-colors
                  "
                >
                  复制
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setShowNewTokenDialog(false);
                setNewlyCreatedToken(null);
              }}
              className="
                w-full py-3
                bg-gradient-to-r from-diary-500 to-orange-500
                hover:from-diary-600 hover:to-orange-600
                text-white font-semibold
                rounded-xl
                shadow-lg
                transition-all duration-300
              "
            >
              我已保存，关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
