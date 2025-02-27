module powerbi.extensibility.visual {

    //Сlass responsible for the work connected with the legend (legend position, scrolling legend, click on the legend),
    // buttons to control the levels of nesting
    export class DrawControlPanel {
        static xStartCoordinate = 0;
        static displayScroll = false;
        public drawControlPanel(
            options: VisualUpdateOptions,
            newModel: ViewModel,
            listTeams: TeamModelList,
            heightOfTheShape,
            numberOfVisibleLevels
        ) {
            this.resetSelectedItems(options, newModel, listTeams);
            if ((DataStorage.isControls) && (options.viewport.height > 130) && (!DataStorage.criticalError)) {
                this.drawingControlButtons(options, heightOfTheShape, newModel, numberOfVisibleLevels, listTeams);
            }
            if ((DataStorage.showLegend) && (!DataStorage.criticalError)) {
                if (DataStorage.legend == "0") {
                    this.drawingMarks(listTeams, true, newModel);
                    if (DrawControlPanel.displayScroll) {
                        this.scrollButtonLeft(listTeams, true, newModel);
                        this.scrollButtonRight(listTeams, true, newModel);
                    }
                }
                if (DataStorage.legend == "1") {

                    this.drawingMarks(listTeams, false, newModel);
                    if (DrawControlPanel.displayScroll) {
                        this.scrollButtonLeft(listTeams, false, newModel);
                        this.scrollButtonRight(listTeams, false, newModel);
                    }
                }
                if (DataStorage.legend == "2") {
                    this.drawingMarksAuto(listTeams, heightOfTheShape, newModel);
                }
            }
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                let drawWarning: DrawWarning = new DrawWarning();
                drawWarning.drawingWarningSign();
            }
        }

        public drawingControlButtons(
            options: VisualUpdateOptions,
            heightOfTheShape,
            newModel: ViewModel,
            numberOfVisibleLevels,
            listTeams: TeamModelList
        ) {
            let xButtonCoordinateAdd = newModel.dataPoints[0].xCoordinate - DataStorage.widthOfTheShape / 1.1;
            let xButtonCoordinateMinus = newModel.dataPoints[0].xCoordinate + DataStorage.widthOfTheShape / 1.1;

            if (DataStorage.displayHeightAndWidth) {
                heightOfTheShape = DataStorage.customShapeHeight;
            }
            let yButtonCoordinate = newModel.dataPoints[0].yCoordinate - heightOfTheShape / 1.2;
            this.drowingButton(options, yButtonCoordinate, xButtonCoordinateAdd, newModel, numberOfVisibleLevels, listTeams, true, "+");
            this.drowingButton(options, yButtonCoordinate, xButtonCoordinateMinus, newModel, numberOfVisibleLevels, listTeams, false, "-");
        }

        public drowingButton(
            options,
            yCoordinate,
            xCoordinate,
            newModel: ViewModel,
            numberOfVisibleLevels,
            listTeams: TeamModelList,
            isChangeLevel,
            sign
        ) {

            DataStorage.nameTextValue = DataStorage.barGroup.append("text")
                .classed("nameTextValue", true);

            DataStorage.nameTextValue
                .text(sign)
                .attr({
                    x: xCoordinate,
                    y: yCoordinate,
                    dy: "0.35em",
                    "text-anchor": "middle"
                }).style("font-size", 40 + "px")
                .style("text-align", "left")
                .on('click', () => {
                    this.clickButtonEvent(options, newModel, numberOfVisibleLevels, listTeams, isChangeLevel);
                })
        }

        public clickButtonEvent(options, newModel: ViewModel, numberOfVisibleLevels, listTeams: TeamModelList, isChangeLevel) {
            DrawElements.deletingOldShapes();
            if (isChangeLevel) {
                if (numberOfVisibleLevels < DataStorage.numbOfLevels - 1) {
                    numberOfVisibleLevels = numberOfVisibleLevels + 1;
                }
            }
            else {
                if (numberOfVisibleLevels + 2 > 1) {
                    numberOfVisibleLevels = numberOfVisibleLevels - 1;
                }
            }
            DataStorage.scrollLeft = 0;
            DataStorage.scrollRight = 1;
            let drawElements: DrawElements = new DrawElements();
            let calculationsForDrawing: CalculationsForDrawing = new CalculationsForDrawing();
            let modelWithVisibleElements = calculationsForDrawing.makingVisibleLevels(newModel, 0, numberOfVisibleLevels);
            calculationsForDrawing.findVisibleLevels(modelWithVisibleElements);
            calculationsForDrawing.countVisibleElemOnEachLevel(modelWithVisibleElements);
            modelWithVisibleElements = calculationsForDrawing.calcOfWeightCof(modelWithVisibleElements);
            let heightOfTheShape = drawElements.drawingElements(options, modelWithVisibleElements, listTeams, numberOfVisibleLevels);
            drawElements.drawingRelationships(modelWithVisibleElements, heightOfTheShape);
            this.drawControlPanel(options, modelWithVisibleElements, listTeams, heightOfTheShape, numberOfVisibleLevels);
        }

        public scrollButtonLeft(listTeams, isBottom, newModel) {

            DataStorage.nameTextValue = DataStorage.barGroup.append("path")
                .classed("nameTextValue", true);

            let yCoordinate = 0;
            if (isBottom) {
                yCoordinate = 5 + 6 * DataStorage.fontLegendSize / 10;
            }
            else {
                yCoordinate = DataStorage.visualWindowHeight - 6 * DataStorage.fontLegendSize / 10 - 45;
            }
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                yCoordinate = yCoordinate + 40;
            }
            let xCoordinateButton = 6;
            if (DataStorage.showLegendTitle) {
                xCoordinateButton = DrawControlPanel.xStartCoordinate - 10;
            }
            let image = "M" + xCoordinateButton + "," + yCoordinate + "," + "L" + (xCoordinateButton + 6) + "," + (yCoordinate - 7) + "L" + (xCoordinateButton + 6) + "," + + (yCoordinate + 7) + "Z";
            DataStorage.nameTextValue
                .style("fill", "black")
                .style("font-weight", "bold")
                .attr("d", image)
                .on('click', () => {
                    if (DataStorage.scrollLeft > 0) {
                        DataStorage.scrollLeft--;
                        DataStorage.scrollRight--;
                        this.clickOnLegendBtnScroll(isBottom, listTeams, newModel);
                    }
                })
        }

        public scrollButtonRight(listTeams: TeamModelList, isBottom, newModel) {

            DataStorage.nameTextValue = DataStorage.barGroup.append("path")
                .classed("nameTextValue", true);

            let yCoordinate = 0;
            if (isBottom) {
                yCoordinate = 5 + 6 * DataStorage.fontLegendSize / 10;
            }
            else {
                yCoordinate = DataStorage.visualWindowHeight - 6 * DataStorage.fontLegendSize / 10 - 45;
            }
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                yCoordinate = yCoordinate + 40;
            }
            let image = "M" + (DataStorage.visualWindowWidth - 6) + "," + yCoordinate + "," + "L" + (DataStorage.visualWindowWidth - 12)
                + "," + (yCoordinate - 7) + "L" + (DataStorage.visualWindowWidth - 12) + "," + + (yCoordinate + 7) + "Z";

            DataStorage.nameTextValue
                .style("fill", "black")
                .style("font-weight", "bold")
                .attr("d", image)
                .on('click', () => {
                    if (DataStorage.scrollRight < listTeams.teamAModel.length) {
                        DataStorage.scrollRight++;
                        DataStorage.scrollLeft++;
                        this.clickOnLegendBtnScroll(isBottom, listTeams, newModel);
                    }
                })
        }

        //drawing of a legend in automatic mode
        public drawingMarksAuto(listTeams: TeamModelList, heightOfTheShape, newModel) {

            let radius = heightOfTheShape / (listTeams.teamAModel.length * 1.5);
            let widthWindow = DataStorage.visualWindowWidth;
            let xCircleCoordinate = radius * 1.2;
            let yCircleCoordinate = radius * 1.5;
            let yCircleCoordinateForTheSecondHalf = radius * 1.5;
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                yCircleCoordinateForTheSecondHalf = yCircleCoordinateForTheSecondHalf + 40;
                yCircleCoordinate = yCircleCoordinate + 40;
            }
            for (let i = 0; i < listTeams.teamAModel.length; i++) {
                if ((listTeams.teamAModel[i].team != null) && (listTeams.teamAModel[i].team != " ") && (listTeams.teamAModel[i].team != "")) {

                    let color = listTeams.teamAModel[i].color;
                    if (i < (listTeams.teamAModel.length / 2)) {
                        this.drawingColorMarks(xCircleCoordinate, yCircleCoordinate, radius, color, listTeams, i, newModel);
                        this.drawingTextMarksAuto(xCircleCoordinate + radius * 2, yCircleCoordinate, listTeams, true, i, newModel);
                        yCircleCoordinate = yCircleCoordinate + radius * 2.5;
                    }
                    else {
                        xCircleCoordinate = widthWindow - radius * 1.2;
                        this.drawingColorMarks(xCircleCoordinate, yCircleCoordinateForTheSecondHalf, radius, color, listTeams, i, newModel);
                        this.drawingTextMarksAuto(DataStorage.visualWindowWidth - radius * 3, yCircleCoordinateForTheSecondHalf, listTeams, false, i, newModel);
                        yCircleCoordinateForTheSecondHalf = yCircleCoordinateForTheSecondHalf + radius * 2.5;
                    }
                }
            }

            for (let i = 0; i < listTeams.teamBModel.length; i++) {
                if ((listTeams.teamBModel[i].team != null) && (listTeams.teamBModel[i].team != " ") && (listTeams.teamBModel[i].team != "")) {

                    let color = listTeams.teamBModel[i].color;
                    if (i < (listTeams.teamBModel.length / 2)) {
                        this.drawingBorderColorMarks(xCircleCoordinate, yCircleCoordinate, radius, color, listTeams, i, newModel);
                        this.drawingTextMarksAuto(xCircleCoordinate + radius * 2, yCircleCoordinate, listTeams, true, i, newModel);
                        yCircleCoordinate = yCircleCoordinate + radius * 2.5;
                    }
                    else {
                        xCircleCoordinate = widthWindow - radius * 1.2;
                        this.drawingBorderColorMarks(xCircleCoordinate, yCircleCoordinateForTheSecondHalf, radius, color, listTeams, i, newModel);
                        this.drawingTextMarksAuto(DataStorage.visualWindowWidth - radius * 3, yCircleCoordinateForTheSecondHalf, listTeams, false, i, newModel);
                        yCircleCoordinateForTheSecondHalf = yCircleCoordinateForTheSecondHalf + radius * 2.5;
                    }
                }
            }
        }

        //drawing of a legend in the upper and lower position
        public drawingMarks(listTeams: TeamModelList, isBottom, newModel) {
            let radius = 5;
            let xCoordinate = radius * 4;
            let yCircleCoordinate = radius * 1.2;
            if (isBottom) {
                yCircleCoordinate = 5 + radius * 1.2 * DataStorage.fontLegendSize / 10;
            }
            else {
                yCircleCoordinate = DataStorage.visualWindowHeight - radius * 1.2 * DataStorage.fontLegendSize / 10 - 45;
            }
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                yCircleCoordinate = yCircleCoordinate + 40;
            }

            if (DataStorage.showLegendTitle) {
                this.drawingTextMarks(xCoordinate, yCircleCoordinate, DataStorage.titleLegend, radius, true, listTeams, 0, newModel);
                xCoordinate = xCoordinate + DataStorage.titleLegend.length * 6 * DataStorage.fontLegendSize / 5;
                DrawControlPanel.xStartCoordinate = xCoordinate;
            }
            DrawControlPanel.displayScroll = false;
            for (let i = DataStorage.scrollLeft; i < DataStorage.scrollRight; i++) {
                if ((listTeams.teamAModel[i].team != null) && (listTeams.teamAModel[i].team != " ") && (listTeams.teamAModel[i].team != "")) {
                    let color = listTeams.teamAModel[i].color;
                    if (i < listTeams.teamAModel.length) {
                        this.drawingColorMarks(xCoordinate, yCircleCoordinate, radius, color, listTeams, i, newModel);
                        xCoordinate = xCoordinate + radius * 2;
                        let team = listTeams.teamAModel[i].team.toString();
                        this.drawingTextMarks(xCoordinate, yCircleCoordinate, team, radius, false, listTeams, i, newModel);
                        xCoordinate = xCoordinate + team.length * 4 * DataStorage.fontLegendSize / 5 + 7;
                    }
                    if ((xCoordinate < DataStorage.visualWindowWidth - 50) && (DataStorage.scrollRight < listTeams.teamAModel.length)) {
                        DataStorage.scrollRight++;
                    }
                    if ((xCoordinate > DataStorage.visualWindowWidth - 50)) {
                        DrawControlPanel.displayScroll = true;
                    }
                }
                if ((listTeams.teamBModel[i].team != null) && (listTeams.teamBModel[i].team != " ") && (listTeams.teamBModel[i].team != "")) {
                    let color = listTeams.teamBModel[i].color;
                    if (i < listTeams.teamBModel.length) {
                        this.drawingBorderColorMarks(xCoordinate, yCircleCoordinate, radius, color, listTeams, i, newModel);
                        xCoordinate = xCoordinate + radius * 2;
                        let team = listTeams.teamBModel[i].team.toString();
                        this.drawingTextMarks(xCoordinate, yCircleCoordinate, team, radius, false, listTeams, i, newModel);
                        xCoordinate = xCoordinate + team.length * 4 * DataStorage.fontLegendSize / 5 + 7;
                    }
                    if ((xCoordinate < DataStorage.visualWindowWidth - 50) && (DataStorage.scrollRight < listTeams.teamBModel.length)) {
                        DataStorage.scrollRight++;
                    }
                    if ((xCoordinate > DataStorage.visualWindowWidth - 50)) {
                        DrawControlPanel.displayScroll = true;
                    }
                }
                else {
                    if ((xCoordinate < DataStorage.visualWindowWidth - 50) && (DataStorage.scrollRight < listTeams.teamAModel.length)) {
                        DataStorage.scrollRight++;
                    }
                }
            }
            DataStorage.scrollRight--;
        }

        //circles on the legend
        public drawingColorMarks(xCircleCoordinate, yCircleCoordinate, radius, color, listTeams: TeamModelList, i, newModel) {

            DataStorage.circle = DataStorage.barGroup.append("circle")
                .classed('circle', true).classed("team" + listTeams.teamAModel[i].teamId, true).classed("controlPanel", true);

            DataStorage.circle
                .style("fill", color)
                .style("stroke", "black")
                .style("stroke-width", 1)
                .attr({
                    r: radius,
                    cx: xCircleCoordinate,
                    cy: yCircleCoordinate
                })
                .on("click", () => {
                    if((d3.event as MouseEvent).ctrlKey){
                        this.selectMultipleEventLegend(listTeams, i, newModel)
                    } else{
                        this.selectSingleEvent(i, listTeams, newModel);
                    }
                });
        }

        //circles on the legend
        public drawingBorderColorMarks(xCircleCoordinate, yCircleCoordinate, radius, color, listTeams: TeamModelList, i, newModel) {

            DataStorage.circle = DataStorage.barGroup.append("circle")
                .classed('circle', true).classed("team" + listTeams.teamBModel[i].teamId, true).classed("controlPanel", true);

            DataStorage.circle
                .style("fill", "white")
                .style("stroke", color)
                .style("stroke-width", 2)
                .attr({
                    r: radius,
                    cx: xCircleCoordinate,
                    cy: yCircleCoordinate
                })
                .on("click", () => {
                    if((d3.event as MouseEvent).ctrlKey){
                        this.selectMultipleEventLegend(listTeams, i, newModel)
                    } else{
                        this.selectSingleEvent(i, listTeams, newModel);
                    }
                });
        }

        public determinationOfBoolSelectionIdTeam(listTeams: TeamModelList) {
            let isSelectedTeam = false;
            for (let i = 0; i < listTeams.teamAModel.length; i++) {
                if (listTeams.teamAModel[i].boolSelectionIds) {
                    isSelectedTeam = true;
                    break;
                }
            }
            return isSelectedTeam;
        }

        //text on the legend
        public drawingTextMarks(xCircleCoordinate, yCircleCoordinate, team, radius, isHeading, listTeams: TeamModelList, i, newModel) {
            let className = "";
            if (!isHeading) {
                className = "controlPanel";
            }
            else {
                className = "isHeading";
            }
            DataStorage.nameTextValue = DataStorage.barGroup.append("text")
                .classed("nameTextValue", true).classed(className, true);

            DataStorage.nameTextValue
                .text(team)
                .attr({
                    x: xCircleCoordinate,
                    y: yCircleCoordinate,
                    dy: "0.35em",
                }).style("font-size", DataStorage.fontLegendSize + "px")
                .style("fill", DataStorage.colorLegend)
                .style("opacity ", "0.9")
                .style("position", "relative")
                .style("text-align", "left")
                .on("click", () => {
                    if((d3.event as MouseEvent).ctrlKey){
                        this.selectMultipleEventLegend(listTeams, i, newModel)
                    } else{
                        this.selectSingleEvent(i, listTeams, newModel);
                    }
                });
                
        }

        //text on the legend in automatic mode
        public drawingTextMarksAuto(xCircleCoordinate, yCircleCoordinate, listTeams: TeamModelList, position, i, newModel) {
            let textAnchor;
            if (position) {
                textAnchor = "start";
            }
            else {
                textAnchor = "end";
            }

            DataStorage.nameTextValue = DataStorage.barGroup.append("text")
                .classed("nameTextValue", true);

            DataStorage.nameTextValue
                .text(listTeams.teamAModel[i].team)
                .attr({
                    x: xCircleCoordinate,
                    y: yCircleCoordinate,
                    dy: "0.35em",
                    "text-anchor": textAnchor
                }).style("font-size", DataStorage.fontLegendSize)
                .style("text-align", "left")
                .style("fill", DataStorage.colorLegend)
                .on("click", () => {
                    if((d3.event as MouseEvent).ctrlKey){
                        this.selectMultipleEventLegend(listTeams, i, newModel)
                    } else{
                        this.selectSingleEvent(i, listTeams, newModel);
                    }
                });
        }

        //click on empty space, reset selected id
        public resetSelectedItems(options, newModel: ViewModel, listTeams: TeamModelList) {
            DataStorage.backgroundWindow.append("rect")
                .style("fill", "transparent")
                .attr({
                    x: 0,
                    y: 0,
                    width: options.viewport.width,
                    height: options.viewport.height
                })
                .on('click', () => {
                    this.resetAllSelectedItems(listTeams, newModel);
                    DataStorage.selectionManager.clear();
                    this.changeVisiblElements(1);
                })
        }

        //click events on any element of the legend withOut Ctrl
        public selectSingleEvent(i, listTeams, newModel){
            DataStorage.selectionManager.clear();
            if (listTeams.teamAModel[i].boolSelectionIds) {
                listTeams.teamAModel[i].boolSelectionIds = false;
                this.resetAllSelectedItems(listTeams, newModel);
                this.changeVisiblElements(1);
            } else {
                this.resetAllSelectedItems(listTeams, newModel);
                listTeams.teamAModel[i].boolSelectionIds = true;
                this.changeVisiblElements(0.5);
                listTeams.teamAModel[i].selectionIds.forEach((selectionId) => {
                    DataStorage.selectionManager.select(selectionId, true);
                });
                DataStorage.barGroup
                .selectAll(".team" + listTeams.teamAModel[i].teamId)
                .style('opacity', 1);
            }
            DataStorage.makeSingleEvent = true;
        }

        //click events on any element of the legend with Ctrl
        private selectMultipleEventLegend(listTeams, i, newModel){
            if(DataStorage.makeSingleEvent){
                DataStorage.selectionManager.clear();
                this.resetAllSelectedItems(listTeams, newModel);
            }
            DataStorage.makeSingleEvent = false;
            if (listTeams.teamAModel[i].boolSelectionIds) {
                listTeams.teamAModel[i].boolSelectionIds = false;
            } else {
                listTeams.teamAModel[i].boolSelectionIds = true;
            }
            let drawElements: DrawElements = new DrawElements();
            if ((this.determinationOfBoolSelectionIdTeam(listTeams))|| drawElements.determinationOfBoolSelectionId(newModel)) {

                this.changeVisiblElements(0.5);
                for (let j = 0; j < listTeams.teamAModel.length; j++) {
                    if (listTeams.teamAModel[j].boolSelectionIds) {
                        DataStorage.barGroup
                            .selectAll(".team" + listTeams.teamAModel[j].teamId)
                            .style('opacity', 1);
                    }
                }
                for (let i = 0; i < newModel.dataPoints.length; i++) {
                    if (newModel.dataPoints[i].boolSelectionId) {
                        DataStorage.barGroup
                        .selectAll(".id" + newModel.dataPoints[i].id)
                        .style('opacity', 1);
                    }
                }
                listTeams.teamAModel[i].selectionIds.forEach((selectionId) => {
                    DataStorage.selectionManager.select(selectionId, true);
                });
            } else {
                DataStorage.selectionManager.clear();
                this.changeVisiblElements(1);
                this.resetAllSelectedItems(listTeams, newModel);
            }
        }

        //click event on the legend scroll button
        private clickOnLegendBtnScroll(isBottom, listTeams, newModel){
            DataStorage.barGroup.selectAll(".controlPanel").remove();
            let radius = 5;
            let widthWindow = DataStorage.visualWindowWidth;

            let xCoordinate = radius * 4;
            if (DataStorage.showLegendTitle) {
                xCoordinate = DrawControlPanel.xStartCoordinate;
            }
            let yCircleCoordinate = radius * 1.2;
            if (isBottom) {
                yCircleCoordinate = 5 + 6 * DataStorage.fontLegendSize / 10;
            }
            else {
                yCircleCoordinate = DataStorage.visualWindowHeight - 6 * DataStorage.fontLegendSize / 10 - 45;
            }
            if ((DataStorage.showWarning) && (DataStorage.isWarning)) {
                yCircleCoordinate = yCircleCoordinate + 40;
            }
            for (let i = DataStorage.scrollLeft; i < DataStorage.scrollRight; i++) {
                if ((listTeams.teamAModel[i].team != null) && (listTeams.teamAModel[i].team != " ") && (listTeams.teamAModel[i].team != "")) {
                    let color = listTeams.teamAModel[i].color;
                    if (i < listTeams.teamAModel.length) {
                        this.drawingColorMarks(xCoordinate, yCircleCoordinate, radius, color, listTeams, i, newModel);
                        xCoordinate = xCoordinate + radius * 2;
                        let team = listTeams.teamAModel[i].team.toString();
                        this.drawingTextMarks(xCoordinate, yCircleCoordinate, team, radius, false, listTeams, i, newModel);
                        xCoordinate = xCoordinate + team.length * 4 * DataStorage.fontLegendSize / 5 + 7;
                    }
                }
            }
        }

        public changeVisiblElements(opacity) {
            DataStorage.barGroup
                .selectAll(".rectangle")
                .style('opacity', opacity);

            DataStorage.barGroup
                .selectAll(".circle")
                .style('opacity', opacity);
        }


        public resetAllSelectedItems(listTeams, newModel){
            for (let j = 0; j < listTeams.teamAModel.length; j++) {
                listTeams.teamAModel[j].boolSelectionIds = false;
            }
            for (let i = 0; i < newModel.dataPoints.length; i++) {
                newModel.dataPoints[i].boolSelectionId = false;
            }
        }
    }
}
