export enum ProjectType {
    IMAGE_RECOGNITION = 'IMAGE_RECOGNITION',
    OBJECT_DETECTION = 'OBJECT_DETECTION',
    NO_PROJECT = ''
}

export function isNoProject(projectType: ProjectType) {
    return projectType === ProjectType.NO_PROJECT;
  }
