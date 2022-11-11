import { IconButton, Image, Spinner } from '@chakra-ui/react';
import { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { RootState, useAppDispatch, useAppSelector } from 'app/store';
import {
  GalleryCategory,
  GalleryState,
  selectNextImage,
  selectPrevImage,
} from './gallerySlice';
import { createSelector } from '@reduxjs/toolkit';
import _ from 'lodash';
import { OptionsState, setIsLightBoxOpen } from 'features/options/optionsSlice';
import ImageMetadataViewer from './ImageMetaDataViewer/ImageMetadataViewer';
import FlexibleLoadingSpinner from 'common/components/FlexibleLoadingSpinner';

export const imagesSelector = createSelector(
  [(state: RootState) => state.gallery, (state: RootState) => state.options],
  (gallery: GalleryState, options: OptionsState) => {
    const { currentCategory, currentImage, intermediateImage } = gallery;
    const { shouldShowImageDetails } = options;

    const tempImages =
      gallery.categories[
        currentImage ? (currentImage.category as GalleryCategory) : 'result'
      ].images;
    const currentImageIndex = tempImages.findIndex(
      (i) => i.uuid === gallery?.currentImage?.uuid
    );
    const imagesLength = tempImages.length;

    return {
      imageToDisplay: intermediateImage ? intermediateImage : currentImage,
      currentCategory,
      isOnFirstImage: currentImageIndex === 0,
      isOnLastImage:
        !isNaN(currentImageIndex) && currentImageIndex === imagesLength - 1,
      shouldShowImageDetails,
      shouldShowPrevImageButton: currentImageIndex === 0,
      shouldShowNextImageButton:
        !isNaN(currentImageIndex) && currentImageIndex === imagesLength - 1,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: _.isEqual,
    },
  }
);

export default function CurrentImagePreview() {
  const dispatch = useAppDispatch();

  const {
    isOnFirstImage,
    isOnLastImage,
    shouldShowImageDetails,
    imageToDisplay,
  } = useAppSelector(imagesSelector);

  const [shouldShowNextPrevButtons, setShouldShowNextPrevButtons] =
    useState<boolean>(false);

  const handleCurrentImagePreviewMouseOver = () => {
    setShouldShowNextPrevButtons(true);
  };

  const handleCurrentImagePreviewMouseOut = () => {
    setShouldShowNextPrevButtons(false);
  };

  const handleClickPrevButton = () => {
    dispatch(selectPrevImage());
  };

  const handleClickNextButton = () => {
    dispatch(selectNextImage());
  };

  const handleLightBox = () => {
    dispatch(setIsLightBoxOpen(true));
  };

  return (
    <div className={'current-image-preview'}>
      {imageToDisplay && (
        <Image
          src={imageToDisplay.url}
          width={imageToDisplay.width}
          height={imageToDisplay.height}
          onClick={handleLightBox}
        />
      )}
      {!shouldShowImageDetails && (
        <div className="current-image-next-prev-buttons">
          <div
            className="next-prev-button-trigger-area prev-button-trigger-area"
            onMouseOver={handleCurrentImagePreviewMouseOver}
            onMouseOut={handleCurrentImagePreviewMouseOut}
          >
            {shouldShowNextPrevButtons && !isOnFirstImage && (
              <IconButton
                aria-label="Previous image"
                icon={<FaAngleLeft className="next-prev-button" />}
                variant="unstyled"
                onClick={handleClickPrevButton}
              />
            )}
          </div>
          <div
            className="next-prev-button-trigger-area next-button-trigger-area"
            onMouseOver={handleCurrentImagePreviewMouseOver}
            onMouseOut={handleCurrentImagePreviewMouseOut}
          >
            {shouldShowNextPrevButtons && !isOnLastImage && (
              <IconButton
                aria-label="Next image"
                icon={<FaAngleRight className="next-prev-button" />}
                variant="unstyled"
                onClick={handleClickNextButton}
              />
            )}
          </div>
        </div>
      )}
      {shouldShowImageDetails && imageToDisplay && (
        <ImageMetadataViewer
          image={imageToDisplay}
          styleClass="current-image-metadata"
        />
      )}
    </div>
  );
}
