module powerbi.extensibility.visual {

    export  class WorkWithTeams {
        //Connection of element type with its color (color is determined by the user)
        public joiningCommandsWithColors(modelWithVisibleElements, viewModel: ViewModel) {
            let listTeams = this.countingTheNumberOfTeams(modelWithVisibleElements, viewModel);

            for (let i = 0; i < listTeams.teamAModel.length; i++) {
                listTeams.teamAModel[i].color = viewModel.teamASet[listTeams.teamAModel[i].team].color;
            }
            return listTeams;
        }

        //Identify the type id to which the user belongs
        public joiningPersonsWithTeamId(team, teamList: TeamModelList): number {
            let teamId = -1;
            for (let i = 0; i < teamList.teamAModel.length; i++) {
                if (teamList.teamAModel[i].team === team) {
                    teamId = teamList.teamAModel[i].teamId;
                    break;
                }
            }
            return teamId;
        }

        //counting the number of teams
        public countingTheNumberOfTeams(newModel: ViewModel, previousModel: ViewModel): TeamModelList {
            let teamModelList: TeamModelList = {
                teamAModel: [],
                teamBModel: []
            };
            let counter = 0;
            let isUniqueTeam;
            for (let i = 0; i < newModel.dataPoints.length; i++) {
                isUniqueTeam = true;
                if ((newModel.dataPoints[i].teamA == " ") || (newModel.dataPoints[i].teamA == null)) {
                    newModel.dataPoints[i].teamA = "";
                }
                for (let j = 0; j < teamModelList.teamAModel.length; j++) {
                    if (newModel.dataPoints[i].teamA === teamModelList.teamAModel[j].team) {
                        isUniqueTeam = false;
                        break;
                    }
                }
                if (isUniqueTeam) {
                    const teamName: string = newModel.dataPoints[i].teamA;

                    let team: TeamModel = {
                        team: newModel.dataPoints[i].teamA,
                        color: "yellow",
                        teamId: counter,
                        boolSelectionIds: false,
                        selectionIds: previousModel.teamASet[teamName].selectionIds || []
                    };
                    counter++;
                    teamModelList.teamAModel.push(team);
                }
            }
            return teamModelList;
        }
    }
}