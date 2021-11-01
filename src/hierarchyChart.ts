module powerbi.extensibility.visual {

    import ISelectionId = powerbi.visuals.ISelectionId;
    import IColorPalette = powerbi.extensibility.IColorPalette;
    import ColorHelper = powerbi.extensibility.utils.color.ColorHelper;


    export class HierarchyChartByAkvelon implements IVisual {

        public host: IVisualHost;
        private colorPalette: IColorPalette;
        private settings: VisualSettings;
        private viewModel: ViewModel;

        private static TeamsAColorIdentifier: DataViewObjectPropertyIdentifier = {
            objectName: "teamsA",
            propertyName: "fill"
        };

        private static TeamsBColorIdentifier: DataViewObjectPropertyIdentifier = {
            objectName: "teamsB",
            propertyName: "fill"
        };

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.colorPalette = this.host.colorPalette;
            DataStorage.selectionManager = options.host.createSelectionManager();
            DataStorage.divOuter = d3.select(options.element).append("div").classed("divOuter", true);
            DataStorage.divInner = DataStorage.divOuter.append("div");
            DataStorage.svg = DataStorage.divInner.append("svg");
            DataStorage.backgroundWindow = DataStorage.svg
                .append("g")
                .classed("backgroundWindow", true);

            DataStorage.barGroup = DataStorage.svg
                .append("g")
                .classed("bar-group", true);
        }

        private sortIndication(firstObject, secondObject) {
            if (firstObject.id > secondObject.id) return 1;
            else if (firstObject.id < secondObject.id) return -1;
            else return 0;
        }

        public update(options: VisualUpdateOptions) {
            DataStorage.scrollLeft = 0;
            DataStorage.scrollRight = 1;
            DataStorage.divOuter.style({ width: `${options.viewport.width}px`, height: `${options.viewport.height}px` });

            DrawElements.deletingOldShapes();
            let viewModel = this.getViewModel(options);
            this.viewModel = viewModel;
            this.settings = VisualSettings.parse(options
                && options.dataViews
                && options.dataViews[0]) as VisualSettings;

            if(navigator.userAgent.search(/.NET/) > 0 ||
                navigator.userAgent.search(/Macintosh/) > 0){
                this.settings.wrap.show = false;
            }


            viewModel.dataPoints = viewModel.dataPoints.sort(this.sortIndication);
            DataStorage.visualWindowWidth = options.viewport.width;
            DataStorage.visualWindowHeight = options.viewport.height;

            //initialization of user values (with tab Format)
            const nodes = this.settings.nodes;
            const links = this.settings.links;
            const levels = this.settings.levels;
            const legend = this.settings.legend;
            const warning = this.settings.warning;
            const tooltip = this.settings.tooltip;
            const wrap = this.settings.wrap;


            DataStorage.colorName = nodes.colorName;
            DataStorage.displayHeightAndWidth = nodes.displayHeightAndWidth;
            DataStorage.customShapeHeight = nodes.height;
            DataStorage.customShapeWidth = nodes.width;
            DataStorage.linksColor = links.color;
            DataStorage.isControls = levels.controls;
            DataStorage.customFontSizeTitle = nodes.fontSize;
            DataStorage.customFontSizeSubtitle = nodes.fontSubtitleSize;
            DataStorage.shapeType = nodes.shape;
            DataStorage.distanceBetweenTitleAndSubtitle = nodes.distanceBetweenTitleAndSubtitle;
            DataStorage.legend = legend.position;
            DataStorage.colorLegend = legend.colorLegend;
            DataStorage.fontLegendSize = legend.fontSize;
            DataStorage.showLegendTitle = legend.showLegend;
            DataStorage.showLegend = legend.show;
            DataStorage.titleLegend = legend.titleLegend;
            DataStorage.isMaxDepth = levels.isMaxDepth;
            DataStorage.showNodes = nodes.show;
            DataStorage.showWarning = warning.show;
            DataStorage.showTooltip = tooltip.show;
            DataStorage.showWraps = wrap.show;
            // DataStorage.showWraps = `\v`===`v` ? false : wrap.show;

            let drawElements: DrawElements = new DrawElements();
            let calculationsForDrawing: CalculationsForDrawing = new CalculationsForDrawing();
            let drawControlPanel: DrawControlPanel = new DrawControlPanel();
            let workWithTeams: WorkWithTeams = new WorkWithTeams();
            let workWithWarning: WorkWithWarning = new WorkWithWarning();

            DataStorage.isWarning = false;
            for (let i = 0; i < viewModel.dataPoints.length; i++) {
                if (viewModel.dataPoints[i].id == null) {
                    viewModel.dataPoints[i].id = "notFound";
                    viewModel.dataPoints[i].reportTo = "notFound";
                }
            }
            let modelWithLevels = calculationsForDrawing.findLevels(viewModel);

            workWithWarning.searchForSimilarId(viewModel);
            if ((viewModel.dataPoints.length != modelWithLevels.dataPoints.length) || (DataStorage.sameId)) {
                workWithWarning.handlingOfWarnings(viewModel, modelWithLevels);
            }

            calculationsForDrawing.searchOfHeirs(modelWithLevels);
            calculationsForDrawing.numbElemOnEachLevl(modelWithLevels);

            DataStorage.maxDepth = this.settings.levels.maxDepth;
            if ((DataStorage.maxDepth > 1) && (DataStorage.maxDepth < DataStorage.numbOfLevels) && (DataStorage.isMaxDepth)) {
                DataStorage.numbOfLevels = DataStorage.maxDepth - 1;
            }
            let numberOfVisibleLevels = DataStorage.numbOfLevels - 1;

            let modelWithVisibleElements = calculationsForDrawing.makingVisibleLevels(modelWithLevels, 0, numberOfVisibleLevels);
            calculationsForDrawing.findVisibleLevels(modelWithVisibleElements);
            calculationsForDrawing.countVisibleElemOnEachLevel(modelWithVisibleElements);

            let listTeams = workWithTeams.joiningCommandsWithColors(modelWithVisibleElements, viewModel);

            modelWithVisibleElements = calculationsForDrawing.calcOfWeightCof(modelWithVisibleElements);

            if (DataStorage.displayHeightAndWidth) {
                DataStorage.divOuter.style("overflow", "auto");
                if ((DataStorage.customShapeHeight > 0) && (DataStorage.customShapeWidth > 0)) {
                    DataStorage.visualWindowHeight = (DataStorage.customShapeHeight + DataStorage.customShapeHeight / 1.3) * DataStorage.numbVisibleLevls;
                    if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                        DataStorage.visualWindowHeight = DataStorage.visualWindowHeight + 100;
                    }
                    DataStorage.visualWindowWidth = DataStorage.customShapeWidth * 1.3 * DataStorage.maxElemWeight;
                }
                else {
                    DataStorage.displayHeightAndWidth = false;
                }
            }

            DataStorage.visualWindowWidth = DataStorage.visualWindowWidth - 25;
            DataStorage.visualWindowHeight = DataStorage.visualWindowHeight - 25;
            let minWindowHeight = 130;
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                minWindowHeight = 180;
            }
            let heightOfTheShape = 0;

            if ((options.viewport.height > minWindowHeight) && (!DataStorage.criticalError)) {
                heightOfTheShape = drawElements.drawingElements(options, modelWithVisibleElements, listTeams, numberOfVisibleLevels);
                drawElements.drawingRelationships(modelWithVisibleElements, heightOfTheShape);
            }
            drawControlPanel.drawControlPanel(options, modelWithVisibleElements, listTeams, heightOfTheShape, numberOfVisibleLevels);
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.settings
                || VisualSettings.getDefault() as VisualSettings;

            const instances = VisualSettings.enumerateObjectInstances(settings, options);

            if (options.objectName === HierarchyChartByAkvelon.TeamsAColorIdentifier.objectName) {
                this.enumerateATeams(instances, options.objectName);
            }
            if (options.objectName === HierarchyChartByAkvelon.TeamsBColorIdentifier.objectName) {
                this.enumerateBTeams(instances, options.objectName);
            }

            return instances;
        }

        private enumerateATeams(instanceEnumeration: VisualObjectInstanceEnumeration, objectName: string): void {
            const teams: string[] = this.viewModel && this.viewModel.teamASet && Object.keys(this.viewModel.teamASet) || [];

            if (!teams || !(teams.length > 0)) {
                return;
            }
            teams.forEach((teamName: string) => {
                const identity: ISelectionId = this.viewModel.teamASet[teamName].selectionIds[0] as ISelectionId,
                    displayName: string = this.viewModel.teamASet[teamName].team;

                this.addAnInstanceToEnumeration(instanceEnumeration, {
                    displayName,
                    objectName,
                    selector: ColorHelper.normalizeSelector(identity.getSelector(), false),
                    properties: {
                        fill: { solid: { color: this.viewModel.teamASet[teamName].color } }
                    }
                });
            });
        }

        
        private enumerateBTeams(instanceEnumeration: VisualObjectInstanceEnumeration, objectName: string): void {
            const teams: string[] = this.viewModel && this.viewModel.teamBSet && Object.keys(this.viewModel.teamBSet) || [];

            if (!teams || !(teams.length > 0)) {
                return;
            }
            teams.forEach((teamName: string) => {
                const identity: ISelectionId = this.viewModel.teamBSet[teamName].selectionIds[0] as ISelectionId,
                    displayName: string = this.viewModel.teamBSet[teamName].team;

                this.addAnInstanceToEnumeration(instanceEnumeration, {
                    displayName,
                    objectName,
                    selector: ColorHelper.normalizeSelector(identity.getSelector(), false),
                    properties: {
                        fill: { solid: { color: this.viewModel.teamBSet[teamName].color } }
                    }
                });
            });
        }

        private getColor(
            properties: DataViewObjectPropertyIdentifier,
            defaultColor: string,
            objects: DataViewObjects): string {

            const colorHelper: ColorHelper = new ColorHelper(
                this.colorPalette,
                properties,
                defaultColor);

            return colorHelper.getColorForMeasure(objects, "");
        }

        private addAnInstanceToEnumeration(
            instanceEnumeration: VisualObjectInstanceEnumeration,
            instance: VisualObjectInstance): void {

            if ((instanceEnumeration as VisualObjectInstanceEnumerationObject).instances) {
                (instanceEnumeration as VisualObjectInstanceEnumerationObject)
                    .instances
                    .push(instance);
            } else {
                (instanceEnumeration as VisualObjectInstance[]).push(instance);
            }
        }

        //getting data from a form (power bi)
        private getViewModel(options: VisualUpdateOptions): ViewModel {
            let dataViews: DataView[] = options.dataViews;

            let viewModel: ViewModel = {
                dataPoints: [],
                teamASet: {},
                teamBSet: {},
                highlights: false
            };

            if (!dataViews
                || !dataViews[0]
                || !dataViews[0].categorical
                || !dataViews[0].categorical.categories
            ) {
                return viewModel;
            }

            const dataView: DataView = dataViews[0];

            const columnIndexes: ColumnIndex = {
                category: -1,
                title: -1,
                reportTo: -1,
                teamA: -1,
                teamB: -1,
                position: -1,
                tooltip: -1,
            };

            dataView.categorical.categories.forEach((column: DataViewCategoryColumn, columnIndex: number) => {
                Object.keys(column.source.roles).forEach((roleName: string) => {
                    columnIndexes[roleName] = columnIndex;
                });
            });

            const categories: DataViewCategoryColumn[] = dataView.categorical.categories;
            const amountOfDataPoints: number = categories[0].values.length;
            const highlights = dataView.categorical.values
                && dataView.categorical.values[0]
                && dataView.categorical.values[0].highlights
                || [];
            for (let dataPointIndex: number = 0; dataPointIndex < amountOfDataPoints; dataPointIndex++) {

                const id: string = categories[columnIndexes.category].values[dataPointIndex] as string;
                let nameOfHeader : string;
                if(categories[columnIndexes.category].identity[dataPointIndex].key) {
                    nameOfHeader = categories[columnIndexes.category].identity[dataPointIndex].key as string;
                }
                const title: string = categories[columnIndexes.title].values[dataPointIndex] as string;
                const reportTo: string = categories[columnIndexes.reportTo].values[dataPointIndex] as string;
                const lvl: number = 0 as number;
                const xCoordinate: number = 0 as number;
                const yCoordinate: number = 0 as number;
                const isVisible: boolean = false as boolean;
                let teamA: string = "" as string;
                let teamB: string = "" as string;
                let position: string = "" as string;
                let tooltip: string = "" as string;
                const teamAId: number = 0 as number;
                const teamBId: number = 0 as number;
                const boolSelectionIds: boolean = false as boolean;
                const isHeirs: boolean = false as boolean;
                const elementWeight: number = 0 as number;
                const parentStartX: number = 0 as number;
                const highlighted: boolean = highlights ? highlights[dataPointIndex] ? true : false : false;
                const selectionId = this.host.createSelectionIdBuilder()
                    .withCategory(categories[columnIndexes.category], dataPointIndex)
                    .createSelectionId();
                const boolSelectionId: boolean = false as boolean;
                if (categories[columnIndexes.position]) {
                    position = categories[columnIndexes.position].values[dataPointIndex] as string;
                } 
                else {
                    position = "";
                }

                if (categories[columnIndexes.teamA]) {
                    teamA = categories[columnIndexes.teamA].values[dataPointIndex] as string;
                } else {
                    teamA = "";
                }
                if (((teamA == " ") || (teamA == null) || (teamA == "")) && (columnIndexes.teamA != -1)) {
                    teamA = "Fill";
                }

                if (categories[columnIndexes.teamB]) {
                    teamB = categories[columnIndexes.teamB].values[dataPointIndex] as string;
                } else {
                    teamB = "";
                }
                if (((teamB == " ") || (teamB == null) || (teamB == "")) && (columnIndexes.teamB != -1)) {
                    teamB = "Fill";
                }

                // for tooltip
                if (categories[columnIndexes.tooltip]) {
                    tooltip = categories[columnIndexes.tooltip].values[dataPointIndex] as string;
                } else {
                    tooltip = "";
                }

                if (!viewModel.teamASet[teamA]) {
                    const color: string = this.getColor(
                        HierarchyChartByAkvelon.TeamsAColorIdentifier,
                        DataStorage.defaultColor,
                        categories[columnIndexes.category].objects
                        && categories[columnIndexes.category].objects[dataPointIndex]
                        || {});

                    viewModel.teamASet[teamA] = {
                        team : teamA,
                        selectionIds: [selectionId],
                        color,
                        teamId: teamAId,
                        boolSelectionIds
                    }
                } else {
                    viewModel.teamASet[teamA].selectionIds.push(selectionId);
                }

                if (!viewModel.teamBSet[teamB]) {
                    const color: string = this.getColor(
                        HierarchyChartByAkvelon.TeamsBColorIdentifier,
                        DataStorage.defaultColor,
                        categories[columnIndexes.category].objects
                        && categories[columnIndexes.category].objects[dataPointIndex]
                        || {});

                    viewModel.teamBSet[teamB] = {
                        team : teamB,
                        selectionIds: [selectionId],
                        color,
                        teamId: teamBId,
                        boolSelectionIds
                    }
                } else {
                    viewModel.teamBSet[teamB].selectionIds.push(selectionId);
                }

                viewModel.dataPoints.push({
                    id,
                    title,
                    reportTo: reportTo,
                    lvl,
                    xCoordinate,
                    yCoordinate,
                    isVisible,
                    teamA,
                    position,
                    selectionId,
                    boolSelectionId,
                    teamAId,
                    highlighted,
                    isHeirs,
                    elementWeight,
                    parentStartX,
                    nameOfHeader,
                    tooltip,
                    teamB,
                    teamBId
                });
            }
            viewModel.highlights = viewModel.dataPoints.filter(d => d.highlighted).length > 0;

            return viewModel;
        }
    }
}
