'use client';
import '@/styles/conversionview.css';
import OriginalPreview from './OriginalPreview';
import AnimatedArrow from './AnimatedArrow';
import ConvertedPreview from './ConvertedPreview';

export default function ConversionView({
  originalPreviewUrl,
  originalInfo,
  converting,
  conversionResult,
  onDownload,
  downloading,
  downloaded,
}) {
  return (
    <div className="conversion-view">
      <OriginalPreview
        previewUrl={originalPreviewUrl}
        info={originalInfo}
      />

      <AnimatedArrow />

      <ConvertedPreview
        converting={converting}
        result={conversionResult}
        onDownload={onDownload}
        downloading={downloading}
        downloaded={downloaded}
      />
    </div>
  );
}