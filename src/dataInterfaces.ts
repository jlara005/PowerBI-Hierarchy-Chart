module powerbi.extensibility.visual {

    import ISelectionId = powerbi.visuals.ISelectionId;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;

    export interface DataPoint {
        id: string;
        title: string;
        reportTo: string;
        lvl: number;
        xCoordinate: number;
        yCoordinate: number;
        isVisible: boolean;
        teamA: string;
        teamAId: number;
        teamB: string;
        teamBId: number;
        position: string;
        isHeirs: boolean;
        selectionId: powerbi.visuals.ISelectionId;
        boolSelectionId: boolean;
        highlighted: boolean;
        elementWeight: number;
        parentStartX: number;
        nameOfHeader: string;
        tooltip: string;
        footer: string;
    };

    export interface ViewModel {
        dataPoints: DataPoint[];
        teamASet?: TeamModelSet;
        teamBSet?: TeamModelSet;
        highlights: boolean;
    };

    export interface TeamModelSet {
        [teamName: string]: TeamModel;
    }

    export interface TeamModel {
        team: string;
        teamId: number;
        color: string;
        boolSelectionIds: boolean;
        selectionIds: ISelectionId[];
    };

    export interface TeamModelList {
        teamAModel: TeamModel[];
        teamBModel: TeamModel[];
    };

    export interface ColumnIndex {
        category?: number;
        title?: number;
        reportTo?: number;
        teamA?: number;
        teamB?: number;
        position?: number;
        tooltip?: number;
        footer?: number;
    }
}    