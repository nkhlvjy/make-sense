import React, { PropsWithChildren } from "react";
import "./ImagesDropZone.scss";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { TextButton } from "../../Common/TextButton/TextButton";
import { ImageData } from "../../../store/labels/types";
import { connect } from "react-redux";
import {
    addData,
  addImageData,
  updateActiveImageIndex,
} from "../../../store/labels/actionCreators";
import { AppState } from "../../../store";
import { ProjectType } from "../../../data/enums/ProjectType";
import { PopupWindowType } from "../../../data/enums/PopupWindowType";
import {
  updateActivePopupType,
  updateProjectData,
} from "../../../store/general/actionCreators";
import { ProjectData } from "../../../store/general/types";
import { sortBy } from "lodash";
import { VideoDataUtil } from "../../../utils/VideoDataUtil";
import { ImageDataUtil } from "../../../utils/ImageDataUtil";

interface IProps {
  updateActiveImageIndexAction: (activeImageIndex: number) => any;
  addImageDataAction: (imageData: ImageData[]) => any;
  addVideoDataAction: (imageData: ImageData[][]) => any;
  addDataAction: (data: any) => any;
  updateProjectDataAction: (projectData: ProjectData) => any;
  updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
  projectData: ProjectData;
}

const ImagesDropZone: React.FC<IProps> = (props: PropsWithChildren<IProps>) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png"],
      "video/*": [".mp4", ".webm"],
    },
  } as DropzoneOptions);

  const startEditor = async (projectType: ProjectType) => {
    if (acceptedFiles.length > 0) {
      const files = sortBy(acceptedFiles, (item: File) => item.name);
      let filteredMp4Files = files.filter(checkTypeMp4)
        
      const updatedVideoArray = await Promise.all(
        filteredMp4Files.map(
            async (file: File) =>
              await VideoDataUtil.createVideoDataFromFileData(file)
          )
      );
      const videoArray = updatedVideoArray
      let filteredImageFiles = files.filter(checkTypeImage)
      props.addDataAction(filteredImageFiles.map((file:File) => ImageDataUtil
                .createImageDataFromFileData(file)));
      props.addDataAction(videoArray);
      props.updateProjectDataAction({
        ...props.projectData,
        type: projectType,
      });
      props.updateActiveImageIndexAction(0);
      props.updateActivePopupTypeAction(PopupWindowType.INSERT_LABEL_NAMES);
    }
  };

    const getDropZoneContent = () => {
        if (acceptedFiles.length === 0)
            return <>
                <input {...getInputProps()} />
                <img
                    draggable={false}
                    alt={'upload'}
                    src={'ico/box-opened.png'}
                />
                <p className='extraBold'>Drop images</p>
                <p>or</p>
                <p className='extraBold'>Click here to select them</p>
            </>;
        else if (acceptedFiles.length === 1)
            return <>
                <img
                    draggable={false}
                    alt={'uploaded'}
                    src={'ico/box-closed.png'}
                />
                <p className='extraBold'>1 image loaded</p>
            </>;
        else
            return <>
                <input {...getInputProps()} />
                <img
                    draggable={false}
                    key={1}
                    alt={'uploaded'}
                    src={'ico/box-closed.png'}
                />
                <p key={2} className='extraBold'>{acceptedFiles.length} images loaded</p>
            </>;
    };

    const startEditorWithObjectDetection = () => startEditor(ProjectType.OBJECT_DETECTION)
    const startEditorWithImageRecognition = () => startEditor(ProjectType.IMAGE_RECOGNITION)

    return(
        <div className='ImagesDropZone'>
            <div {...getRootProps({className: 'DropZone'})}>
                {getDropZoneContent()}
            </div>
            <div className='DropZoneButtons'>
                <TextButton
                    label={'Object Detection'}
                    isDisabled={!acceptedFiles.length}
                    onClick={startEditorWithObjectDetection}
                />
                <TextButton
                    label={'Image recognition'}
                    isDisabled={!acceptedFiles.length}
                    onClick={startEditorWithImageRecognition}
                />
            </div>
        </div>
    )
};

function checkTypeMp4(file: File) {
    if (file.type === 'video/mp4') {
        return true
    } else {
        return false
    }
}

function checkTypeImage(file: File) {
    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        return true
    } else {
        return false
    }
}

const mapDispatchToProps = {
    updateActiveImageIndexAction: updateActiveImageIndex,
    addImageDataAction: addImageData,
    addDataAction: addData,
    updateProjectDataAction: updateProjectData,
    updateActivePopupTypeAction: updateActivePopupType
};

const mapStateToProps = (state: AppState) => ({
    projectData: state.general.projectData
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImagesDropZone);
