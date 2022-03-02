import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

/*
class PersonData {
    name;
    idVal;
    points;
    constructor(name, idVal, points)
    {
        this.name = name;
        this.idVal = idVal;
        this.points = points;
    }
}
//*/

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [{name: "", idVal: "", points: "", id: "-1"}],
            currentPerson: {name: "", idVal: "", points: "", id: "-1"},  //idVal: json-server makes the "id" property immutable, so to change ID it's gotta be something different
            setCurrentPerson: (p) => {this.setState({currentPerson: p});},
            error: ""
        }
    }

    componentDidMount() {
        //on load
        let url = "http://localhost:3000/people";
        fetch(url).then(res => res.json()).then(peopleData => {  //GET request, reponse is an array of person data

            this.setState({data: peopleData});  //add the data acquired, and add the names array
        },
        (error) => {
            this.setState({error: "Database failed to respond. " + error});
        });
    }

    getPerson() {
        let index = -1;
        let target = Number(document.forms[0].names.value);  //selected name in the dropdown
        console.log(target);
        
        for(let i = 0; i < this.state.data.length; i++)
        {
            if (Number(this.state.data[i].id) === target)
            {
                index = i;
                break;
            }
        }

        let found = {};
        let errMsg = "";

        if (index < 0)
        {
            found = {name: "", idVal: "", points: "", id: "-1"};  //if not found, fallback on empty person
            if (target !== -1)
                errMsg = "Warning: Person not found.";
        }
        else
            found = Object.assign({}, this.state.data[index]);  //if found, supply the data

        this.setState({currentPerson: found, error: errMsg});  //update current person, which updates the Person class's input fields
    }

    createPerson() {
        let newPerson = this.state.currentPerson;
        newPerson.id = newPerson.idVal;

        let url = "http://localhost:3000/people";
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPerson)
        };
        fetch(url, requestOptions).then(
            (res) => res.json()
            ).then((data) => {  //post on the database, data is the created person

            let newData = this.state.data;
            newData.push(data);  //add the new data to the end of the data array

            this.setState({data: newData, currentPerson: data, error: ""});  //update state

            document.forms[0].names.value = data.id;  //make sure the dropdown in the form is selecting the new item
        },
        (error) => {
            this.setState({error: "Create Person failed. " + error});
        });
    }

    updatePerson() {
        let updatePerson = this.state.currentPerson;

        let url = "http://localhost:3000/people/" + updatePerson.id;  //request on the person's database ID
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePerson)
        };
        fetch(url, requestOptions).then((res) => res.json()).then((data) => {  //patch on the database, data is the updated person data
            let foundIndex = -1;
            let updateData = this.state.data;

            for(let i = 0; i < updateData.length; i++)
            {
                if (Number(updateData[i].id) === Number(data.id))
                {
                    foundIndex = i;  //get the index of the updated data item in the state's data array
                    break;
                }
            }

            if (foundIndex >= 0)
            {
                updateData[foundIndex] = data;  //update the data's fields
                this.setState({data: updateData, error: ""});  //update the state
                document.forms[0].names.value = data.id;  //update the dropdown's selected name to select the updated name
            }
            else
                this.setState({error: "Update Person failed. No person found with that ID."});   
        },
        (error) => {
            this.setState({error: "Update Person failed. " + error});
        });
    }

    deletePerson()
    {
        let deletePerson = this.state.currentPerson;
        let url = "http://localhost:3000/people/" + deletePerson.id;  //request on the person's database ID

        const requestOptions = {
            method: 'DELETE'
        };

        fetch(url, requestOptions).then((res) => res.json()).then((data) => {  //data is an empty Object
            let deleteData = this.state.data.filter((val, id, arr) => {
                return Number(val.id) !== Number(deletePerson.id);  //take out the deleted person from the data array
            });

            document.forms[0].names.value = "-1";  //set dropdown back to default (N/A)

            this.setState({data: deleteData, currentPerson: {name: "", idVal: "", points: "", id: "-1"}, error: ""});  //update state, unsetting the current person
        },
        (error) => {
            this.setState({error: "Delete Person failed. " + error});
        });
    }

    render() {
        let names = [];

        names.push(<option value="-1" key={0}>N/A</option>);

        for(let i = 0; i < this.state.data.length; i++)
        {
            names.push(<option value={this.state.data[i].id} key={i+1}>{this.state.data[i].name}</option>);  //programmatically fill the dropdown array with the names
        }

        return (
            <>
                <h1>Homework 1 - Stephen Policelli</h1>
                <Person 
                    value={{person: this.state.currentPerson, update: this.state.setCurrentPerson}}
                />
                <div className="app-vert-space get-person">
                    <form className="app-vert-space">
                        <label htmlFor="names" id="names" className="app-horiz-space">Person:</label>
                        <select className="app-horiz-space" name="names">
                            {names}
                        </select>
                    </form>
                    <button className="app-horiz-space app-vert-space" onClick={() => this.getPerson()}>Get Person</button>
                </div>
                <div className="cr-up-de app-vert-space">
                    <button className="app-vert-space app-horiz-space" onClick={() => this.createPerson()}>Create Person</button>
                    <button className="app-vert-space app-horiz-space" onClick={() => this.updatePerson()}>Update Person</button>
                    <button className="app-vert-space app-horiz-space" onClick={() => this.deletePerson()}>Delete Person</button>
                </div>
                <Error value={this.state.error} />
            </>
            )
    }
}

class Person extends React.Component {
    handleNameChange(event) {
        let person = this.props.value.person;
        person.name = event.target.value;  //update the name
        this.props.value.update(this.props.value.person);  //send the update back to the App class
    }

    handleIDChange(event) {
        let person = this.props.value.person;
        person.idVal = event.target.value;  //update the ID value
        this.props.value.update(this.props.value.person);  //send the update back to the App class
    }

    handlePointsChange(event) {
        let person = this.props.value.person;
        person.points = event.target.value;  //update the points
        this.props.value.update(this.props.value.person);  //send the update back to the App class
    }

    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Points</th>
                    </tr>
                    <tr>
                        <td>
                            <input
                                value={this.props.value.person.name}
                                onChange={(e) => {this.handleNameChange(e)}}
                            >
                            </input>
                        </td>
                        <td>
                            <input
                                value={this.props.value.person.idVal}
                                onChange={(e) => {this.handleIDChange(e)}}>
                            </input>
                        </td>
                        <td>
                            <input
                                value={this.props.value.person.points}
                                onChange={(e) => {this.handlePointsChange(e)}}>
                            </input>
                        </td>
                    </tr>
                </thead>
            </table>
        );
    }
}

class Error extends React.Component {
    render() {
        return (
            <div className="error">
                {this.props.value}
            </div>
        );
    }
}

//

ReactDOM.render(<App />, document.getElementById('root'));