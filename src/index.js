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
            data: [{name: "", idVal: "", points: ""}],
            names: ["Test1"],
            currentPerson: {name: "", idVal: "", points: ""},  //idVal: json-server makes the "id" property immutable, so to change ID it's gotta be something different
            setCurrentPerson: (p) => {this.setState({currentPerson: p});}
        }
    }

    componentDidMount() {
        //on load
        let url = "http://localhost:3000/people";
        fetch(url).then(res => res.json()).then(peopleData => {  //GET request, reponse is an array of person data
            let namesData = [];
            for(let person of peopleData)
            {
                namesData.push(person.name);  //create an array of names to populate the dropdown
            }

            this.setState({data: peopleData, names: namesData});  //add the data acquired, and add the names array
        });
    }

    getPerson() {
        let index = -1;
        let target = document.forms[0].names.value;  //selected name in the dropdown
        
        for(let i = 0; i < this.state.data.length; i++)
        {
            if (this.state.data[i].name === target)
            {
                index = i;
                break;
            }
        }

        let found = {};

        if (index < 0)
            found = {name: "", idVal: "", points: ""};  //if not found, fallback on empty person
        else
            found = Object.assign({}, this.state.data[index]);  //if found, supply the data

        this.setState({currentPerson: found});  //update current person, which updates the Person class's input fields
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
        fetch(url, requestOptions).then((res) => res.json()).then((data) => {  //post on the database, data is the created person
            let newNames = this.state.names;
            newNames.push(data.name);  //add the new name to the end of the names array

            let newData = this.state.data;
            newData.push(data);  //add the new data to the end of the data array

            this.setState({data: newData, currentPerson: data, names: newNames});  //update state

            document.forms[0].names.value = data.name;  //make sure the dropdown in the form is selecting the new item
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
            let updateNames = this.state.names;

            for(let i = 0; i < updateData.length; i++)
            {
                if (updateData[i].id === data.id)
                {
                    foundIndex = i;  //get the index of the updated data item in the state's data array
                    break;
                }
            }

            if (foundIndex >= 0)
            {
                updateData[foundIndex] = data;  //update the data's fields
                updateNames[foundIndex] = data.name;  //update the name array with the updated name
            }

            this.setState({data: updateData, names: updateNames});  //update the state

            document.forms[0].names.value = data.name;  //update the dropdown's selected name to select the updated name
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
                return val.id !== deletePerson.id;  //take out the deleted person from the data array
            });

            let deleteNames = this.state.names.filter((val, id, arr) => {
                return val !== deletePerson.name;  //take out the delete name from the names array
            });

            document.forms[0].names.value = "";  //set dropdown back to default (N/A)

            this.setState({data: deleteData, names: deleteNames, currentPerson: {name: "", idVal: "", points: ""}});  //update state, unsetting the current person
        });
    }

    render() {
        let names = [];

        names.push(<option value="na" key={0}>N/A</option>);

        for(let i = 0; i < this.state.names.length; i++)
        {
            names.push(<option value={this.state.names[i]} key={i+1}>{this.state.names[i]}</option>);  //programmatically fill the dropdown array with the names
        }

        return (
            <>
                <h1>Homework 1 - Stephen Policelli</h1>
                <Person 
                    value={{person: this.state.currentPerson, update: this.state.setCurrentPerson}}
                    onChange={(e) => {this.handlePersonChange(e)}}
                />
                <form>
                    <label htmlFor="names" id="names"></label>
                    <select name="names">
                        {names}
                    </select>
                </form>
                <button onClick={() => this.getPerson()}>Get Person</button>
                <button onClick={() => this.createPerson()}>Create Person</button>
                <button onClick={() => this.updatePerson()}>Update Person</button>
                <button onClick={() => this.deletePerson()}>Delete Person</button>
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

//

ReactDOM.render(<App />, document.getElementById('root'));