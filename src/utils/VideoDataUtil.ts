import { ImageData } from "../store/labels/types";
import { v4 as uuidv4 } from "uuid";
import { FileUtil } from "./FileUtil";
import { ImageRepository } from "../logic/imageRepository/ImageRepository";

export class VideoDataUtil {
  public static async createVideoDataFromFileData(
    fileData: File
  ): Promise<ImageData[]> {
    return new Promise((resolve) => {
      let videoObjectUrl = URL.createObjectURL(fileData);
      let video = document.createElement("video");
      let imagesData: ImageData[] = [];

      let seekResolve;
      video.addEventListener("seeked", async function () {
        if (seekResolve) seekResolve();
      });

      video.addEventListener("loadeddata", async function () {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let [w, h] = [video.videoWidth, video.videoHeight];
        canvas.width = w;
        canvas.height = h;

        let frames = [];
        let interval = 100;
        let currentTime = 0;
        let duration = video.duration;

        while (currentTime < duration) {
          video.currentTime = currentTime;
          await new Promise((r) => (seekResolve = r));

          context.drawImage(video, 0, 0, w, h);
          let base64ImageData = canvas.toDataURL();
          frames.push(base64ImageData);

          currentTime += interval;
        }

        let i=0
        for (const image of frames) {
          const base64Response = await fetch(image);
          const blob = await base64Response.blob();
          const file = new File([blob], 'newfile-'+i)
          imagesData.push({
            id: uuidv4(),
            fileData: file,
            loadStatus: false,
            labelRects: [],
            labelPoints: [],
            labelLines: [],
            labelPolygons: [],
            labelNameIds: [],
            isVisitedByYOLOObjectDetector: false,
            isVisitedBySSDObjectDetector: false,
            isVisitedByPoseDetector: false,
            isVisitedByRoboflowAPI: false,
          });
          i++
        }
        resolve(imagesData);
      });
      // set video src *after* listening to events in case it loads so fast
      // that the events occur before we were listening.
      video.src = videoObjectUrl;
    });
  }

  public static cleanAnnotations(item: ImageData): ImageData {
    return {
      ...item,
      labelRects: [],
      labelPoints: [],
      labelLines: [],
      labelPolygons: [],
      labelNameIds: [],
    };
  }

  public static arrange(
    items: ImageData[],
    idArrangement: string[]
  ): ImageData[] {
    return items.sort((a: ImageData, b: ImageData) => {
      return idArrangement.indexOf(a.id) - idArrangement.indexOf(b.id);
    });
  }

  public static loadMissingImages(images: ImageData[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const missingImages = images.filter((i: ImageData) => !i.loadStatus);
      const missingImagesFiles = missingImages.map(
        (i: ImageData) => i.fileData
      );
      FileUtil.loadImages(missingImagesFiles)
        .then((htmlImageElements: HTMLImageElement[]) => {
          ImageRepository.storeImages(
            missingImages.map((i: ImageData) => i.id),
            htmlImageElements
          );
          resolve();
        })
        .catch((error: Error) => reject(error));
    });
  }
}
