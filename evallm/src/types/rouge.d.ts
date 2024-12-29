declare module 'rouge' {
    export class Rouge {
        score(candidate: string, reference: string): any;
    }
}