'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface QRCodeDisplayProps {
  pollId: string;
}

export default function QRCodeDisplay({ pollId }: QRCodeDisplayProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/poll/${pollId}`);
  }, [pollId]);

  if (!url) return null;

  return (
    <div className="flex flex-col items-center space-y-3">
      <QRCodeSVG value={url} size={200} />
      <div className="text-sm text-gray-600 break-all text-center">
        {url}
      </div>
    </div>
  );
}