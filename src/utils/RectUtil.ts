import {IRect} from '../interfaces/IRect';
import {IPoint} from '../interfaces/IPoint';
import {ISize} from '../interfaces/ISize';
import {RectAnchor} from '../data/RectAnchor';
import {NumberUtil} from './NumberUtil';
import {Direction} from '../data/enums/Direction';
import { LabelRect } from 'src/store/labels/types';

export class RectUtil {
    public static getRatio(rect: IRect): number {
        if (!rect) return null;

        return rect.width/rect.height
    }

    public static intersect(r1: IRect, r2: IRect) {
        if (!r1 || !r2) return null;
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }

    public static isPointInside(rect: IRect, point: IPoint): boolean {
        if (!rect || !point) return null;
        return (
            rect.x <= point.x &&
            rect.x + rect.width >= point.x &&
            rect.y <= point.y &&
            rect.y + rect.height >= point.y
        )
    }

    public static getRectWithCenterAndSize(centerPoint: IPoint, size: ISize, rotation: number): IRect {
        return {
            x: centerPoint.x - 0.5 * size.width,
            y: centerPoint.y - 0.5 * size.height,
            rotation: rotation,
            ...size
        }
    }

    public static fitInsideRectWithRatio(containerRect: IRect, ratio: number): IRect {
        const containerRectRatio = RectUtil.getRatio(containerRect);
        if (containerRectRatio < ratio) {
            const innerRectHeight = containerRect.width / ratio;
            return {
                x: containerRect.x,
                y: containerRect.y + (containerRect.height - innerRectHeight) / 2,
                rotation: 0,
                width: containerRect.width,
                height: innerRectHeight
            }
        }
        else {
            const innerRectWidth = containerRect.height * ratio;
            return {
                x: containerRect.x + (containerRect.width - innerRectWidth) / 2,
                y: containerRect.y,
                width: innerRectWidth,
                height: containerRect.height,
                rotation: 0
            }
        }
    }

    public static resizeRect(inputRect: IRect, rectAnchor: Direction, delta): IRect {
        const rect: IRect = {...inputRect};
        switch (rectAnchor) {
            case Direction.RIGHT:
                rect.width += delta.x;
                break;
            case Direction.BOTTOM_RIGHT:
                rect.width += delta.x;
                rect.height += delta.y;
                break;
            case Direction.BOTTOM:
                rect.height += delta.y;
                break;
            case Direction.TOP_RIGHT:
                rect.width += delta.x;
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.TOP_LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                rect.y += delta.y;
                rect.height -= delta.y;
                break;
            case Direction.LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                break;
            case Direction.BOTTOM_LEFT:
                rect.x += delta.x;
                rect.width -= delta.x;
                rect.height += delta.y;
                break;
        }

        if (rect.width < 0) {
            rect.x = rect.x + rect.width;
            rect.width = -rect.width;
        }

        if (rect.height < 0) {
            rect.y = rect.y + rect.height;
            rect.height = -rect.height;
        }

        return rect;
    }

    public static translate(rect: IRect, delta: IPoint): IRect {
        return {
            ...rect,
            x: rect.x + delta.x,
            y: rect.y + delta.y
        }
    }

    public static areOverlapping(labelRect: LabelRect, rectangle: IRect) {
        let x1 = labelRect.rect.x
        let x2 = labelRect.rect.x +labelRect.rect.width
        let y1 = labelRect.rect.y
        let y2 = labelRect.rect.y +labelRect.rect.height
        let X1 = RectUtil.getMin(x1,x2)
        let X2 = RectUtil.getMax(x1,x2)
        let Y1 = RectUtil.getMin(y1,y2)
        let Y2 = RectUtil.getMax(y1,y2)
        let a1 = rectangle.x
        let a2 = rectangle.x + rectangle.width
        let b1 = rectangle.y
        let b2 = rectangle.y + rectangle.height
        let A1 = RectUtil.getMin(a1,a2)
        let A2 = RectUtil.getMax(a1,a2)
        let B1 = RectUtil.getMin(b1,b2)
        let B2 = RectUtil.getMax(b1,b2)
        return !(A1>X2 || A2<X1 || Y1>B2 || Y2<B1) 
    }

    public static getMax(x1: number, x2: number) {
        return x1<x2?x2:x1
    }

    public static getMin(x1: number, x2: number) {
        return x1<x2?x1:x2
    }

    public static expand(rect: IRect, delta: IPoint): IRect {
        return {
            x: rect.x - delta.x,
            y: rect.y - delta.y,
            width: rect.width + 2 * delta.x,
            height: rect.height + 2 * delta.y,
            rotation: 0
        }
    }

    public static scaleRect(rect:IRect, scale: number): IRect {
        return {
            x: rect.x * scale,
            y: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
            rotation: rect.rotation
        }
    }

    public static mapRectToAnchors(rect: IRect): RectAnchor[] {
        const center: IPoint = {x: rect.x+ 0.5 * rect.width, y: rect.y + 0.5 * rect.height}
        return [
            {type: Direction.TOP_LEFT, position: RectUtil.rotatePoint({x: rect.x, y: rect.y}, center, rect.rotation)},
            {type: Direction.TOP, position: RectUtil.rotatePoint({x: rect.x + 0.5 * rect.width, y: rect.y}, center, rect.rotation)},
            {type: Direction.TOP_RIGHT, position: RectUtil.rotatePoint({x: rect.x + rect.width, y: rect.y}, center, rect.rotation)},
            {type: Direction.LEFT, position: RectUtil.rotatePoint({x: rect.x, y: rect.y + 0.5 * rect.height}, center, rect.rotation)},
            {type: Direction.RIGHT, position: RectUtil.rotatePoint({x: rect.x + rect.width, y: rect.y + 0.5 * rect.height}, center, rect.rotation)},
            {type: Direction.BOTTOM_LEFT, position: RectUtil.rotatePoint({x: rect.x, y: rect.y + rect.height}, center, rect.rotation)},
            {type: Direction.BOTTOM, position: RectUtil.rotatePoint({x: rect.x + 0.5 * rect.width, y: rect.y + rect.height}, center, rect.rotation)},
            {type: Direction.BOTTOM_RIGHT, position: RectUtil.rotatePoint({x: rect.x + rect.width, y: rect.y + rect.height}, center, rect.rotation)}
        ]
    }

    public static rotatePoint(point: IPoint, center: IPoint, angle: number) {
        var cosTheta = Math.cos(angle);
        var sinTheta = Math.sin(angle);
      
        var translatedX = point.x - center.x;
        var translatedY = point.y - center.y;
      
        var rotatedX = translatedX * cosTheta - translatedY * sinTheta;
        var rotatedY = translatedX * sinTheta + translatedY * cosTheta;
      
        var finalX = rotatedX + center.x;
        var finalY = rotatedY + center.y;
      
        return { x: finalX, y: finalY };
      }

    public static snapPointToRect(point: IPoint, rect: IRect): IPoint {
        if (RectUtil.isPointInside(rect, point))
            return point;

        return {
            x: NumberUtil.snapValueToRange(point.x, rect.x, rect.x + rect.width),
            y: NumberUtil.snapValueToRange(point.y, rect.y, rect.y + rect.height)
        }
    }

    public static getCenter(rect: IRect): IPoint {
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        }
    }

    public static getSize(rect: IRect): ISize {
        return {
            width: rect.width,
            height: rect.height
        }
    }

    public static getVertices(rect: IRect): IPoint[] {
        return [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height }
        ]
    }
}


