'use client';
import '@/styles/preview.css';
import UploadInfo from './UploadInfo';

export default function OriginalPreview({ previewUrl, info }) {
  return (
    <div className="preview-box preview-box--original">
      <div className="preview-box__label">Original</div>
      <div className="preview-box__image-wrap">
        {previewUrl && (
          <img src={previewUrl} alt="Original" draggable={false} />
        )}
      </div>
      {info && (
        <div className="preview-box__info">
          <UploadInfo
            format={info.format}
            sizeBytes={info.sizeBytes}
            width={info.width}
            height={info.height}
          />
        </div>
      )}
    </div>
  );
}