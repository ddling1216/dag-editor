import { Editor } from './core';
export declare class Canvas {
    constructor(cvs: HTMLCanvasElement, { ratio, fillStyle, strokeStyle, hasStore, }: {
        ratio: number;
        fillStyle?: string;
        strokeStyle?: string;
        hasStore?: boolean;
    });
    canvas: HTMLCanvasElement;
    ratio: number;
    ctx: CanvasRenderingContext2D;
    hasStore: boolean;
    paths: {
        nodes: {
            [id: string]: Path2D;
        };
        edges: {
            [id: string]: Path2D;
        };
        anchors: {
            [id: string]: Array<{
                type: string;
                index: number;
                path: Path2D;
            }>;
        };
    };
    translateInfo: {
        x: number;
        y: number;
    };
    translate(dx: number, dy: number): void;
    transform(dx: number, dy: number): void;
    restore(): void;
    paintNode(node: Editor.INode, status?: string): void;
    checkInNode(nid: string, pos: Editor.IPos): boolean;
    private _paintAnchor;
    checkInNodeAnchor(node: Editor.INode, pos: Editor.IPos): [Editor.INode, string, number];
    paintActiveAnchors(node: Editor.INode): void;
    private _paintActiveAnchor;
    paintEdge({ x: sx, y: sy }: Editor.IPos, // start
    { x: ex, y: ey }: Editor.IPos, // end
    opts?: {
        id?: string;
        selected?: boolean;
    }): void;
    checkOnEdge(eid: string, pos: Editor.IPos): boolean;
    private _paintArrow;
    clear(): void;
}
