/**
 * TODO: Find and implement REACT-complient datepicker
 */

/**
 * Outermost wrapper for page. Binds events for loading rules from server, maintaining state
 * handling the submit/deletion of a rule, etc.
 * Contains table and form
 */
var RuleBox = React.createClass({
  // Loads rules from server, uses an HTSQL endpoint supplied by final render function
  loadRulesFromServer: function() {
    $.ajax({
      url: this.props.ruleUrl,
      dataType: 'text',
      success: function(data) {
        // TODO: why does return json from HTSQL not properly parse?
        data = $.parseJSON(data);
        this.setState({data: data['rules']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.ruleUrl, status, err.toString());
      }.bind(this)
    });
  },
  handleRuleSubmit: function(rule) {
    //add method to api endpoint
    var submitUrl = this.props.apiUrl+'add_rule';
    $.ajax({
      url: submitUrl,
      type: 'POST',
      data: rule,
      success: function(data) {
        // on success, refresh state to current rules from server
        this.loadRulesFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(submitUrl, status, err.toString());
      }.bind(this)
    });
  },
  handleRuleDelete: function(ruleId) {
    //add method to api endpoint
    var deleteUrl = this.props.apiUrl+'delete_rule';
    $.ajax({
      url: deleteUrl,
      type: 'POST',
      //turn data into object
      data: {ruleId: ruleId},
      success: function(data) {
        // on success, refresh state to current rules from server
        this.loadRulesFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(deleteUrl, status, err.toString());
      }.bind(this)
    });
  },
  // initial empty state
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    // First data load from server
    this.loadRulesFromServer();
    setInterval(this.loadRulesFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="ruleBox">
        <h2>Rules</h2>
        <RuleTable data={this.state.data} onRuleDelete={this.handleRuleDelete} />
        <h3> Add a rule </h3>
        <RuleForm onRuleSubmit={this.handleRuleSubmit}/>
      </div>
    );
  }
});

// The table that displays all current rules data
var RuleTable = React.createClass({
  handleDelete: function(ruleId) {
    // call supplied function (which is a function of parent)  to handle deleting a rule.
    this.props.onRuleDelete(ruleId);
  },
  render: function() {
      //TODO: move styles to css, use class identifiers, image (red "X") as delete button
      var deleteStyle = {cursor: 'pointer'};
      // there is probably a more "canon" way of passing a method/self reference in that i'm missing....
      var self = this;
      var rules = this.props.data.map(function(rule) {
        return (
          <tr key={rule.id}>
              <td>
                <span style={deleteStyle} onClick={self.handleDelete.bind(self, rule.id)}>(delete)</span>
                {rule.name}
              </td>
              <td className="{rule.type}">{rule.type == 'credit' ? '+' : '-'}{rule.amount.toFixed(2)}</td>
              <td>{rule.category}</td>
              <td>{rule.start}</td>
              <td>{rule.interval > 0 ? rule.interval+' '+rule.unit : 'none'}</td>
              <td>{rule.note}</td>
          </tr>
          );
    });
    return (
      <table className="ruleTable">
          <thead>
            <RuleHeader />
          </thead>
          <tbody>
            {rules}
          </tbody>
      </table>
    );
  }
});

// Probably unnecessary to use a react class for this, static table header row.
var RuleHeader = React.createClass({
  render: function() {
    return (
      <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Start</th>
          <th>Repeat</th>
          <th>Note</th>
      </tr>
    );
  }
});

//Form for submitting new rules.
var RuleForm = React.createClass({
  //Handle submitting new rule, get data, prevent page reload, pass data to parent function to interact with API
  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.refs.name.getDOMNode().value.trim();
    //TODO: user is currently hardcoded into hidden field in form - should be populated from login/cookie
    var user = this.refs.user.getDOMNode().value.trim();
    // TODO: validate amount is a number (strip all other chars), one decimal point, round to 2 decimals
    var amount = this.refs.amount.getDOMNode().value.trim();
    var category = this.refs.category.getDOMNode().value.trim();
    var start = this.refs.start.getDOMNode().value.trim();
    var repeat = this.refs.repeat.getDOMNode().checked;
    var interval = this.refs.interval.getDOMNode().value.trim();
    var unit = this.refs.unit.getDOMNode().value.trim();
    var note = this.refs.note.getDOMNode().value.trim();
    
    ruleObject = {name: name, user: user, amount: amount, category: category, start: start, note: note};
    if (repeat) {
      ruleObject.interval = interval;
      ruleObject.unit = unit;
    } else {
      ruleObject.interval = null;
      ruleObject.unit = null;
    }

    // Pass data object to parent function
    this.props.onRuleSubmit(ruleObject);
    
    this.refs.name.getDOMNode().value = null;
    // TODO: implement user, this will be populated into calling template
    // this.refs.user.getDOMNode().value = null;
    this.refs.amount.getDOMNode().value = null;
    this.refs.category.getDOMNode().value = 1;
    this.refs.start.getDOMNode().value = null;
    this.refs.repeat.getDOMNode().checked = false;
    this.refs.interval.getDOMNode().value = 1;
    this.refs.unit.getDOMNode().value = 'days';
    this.refs.note.getDOMNode().value = null;
  },
  render: function() {
    /*TODO: use identifiers (classes), move styling to CSS file.*/
    var amountSpanStyle = {width: '5%', fontSize:'1.1em', paddingRight:'1%'};
    var amountInputStyle = {width: '95%'};

    var repeatSpanStyle = {width: '20%', fontSize:'1.1em', paddingRight:'1%'};
    var repeatInputStyle = {width: '20%'};

    var dateSpanStyle = {width: '15%', fontSize:'1.1em', paddingRight:'1%'};
    var dateInputStyle = {width: '85%'};

    var intervalSpanStyle = {width: '20%', fontSize:'1.1em', paddingRight:'1%'};
    var intervalInputStyle = {width: '20%'};
    //return rendered form.
    return (
      <form className="ruleForm" onSubmit={this.handleSubmit}>
        <input type="hidden" value="1" ref="user" />
        <div>
          <input type="text" placeholder="Name" ref="name"/>
        </div>
        <div>
          <span style={amountSpanStyle}>$</span>
          <input style={amountInputStyle} type="text" placeholder="Amount" ref="amount"/>
        </div>
        <div>
          <CategorySelect ref="category"/>
        </div>
        <div>
          <span style={dateSpanStyle}>Start:</span>
          <input type="text" ref="start" style={dateInputStyle}/>
        </div>
        <div>
          <span style={repeatSpanStyle}>Repeat?</span>
          <input type="checkbox" ref="repeat" style={repeatInputStyle}/>
        </div>
          <span style={dateSpanStyle}>Repeats every</span>
          <IntervalSelector ref="interval"/><UnitSelector ref="unit"/>
        <div>
          <textarea placeholder="Notes . . ." ref="note" />
          </div>
        <div>
          <input type="submit" value="Add Rule" />
        </div>
      </form>
    );
  }
});

// Builds selector for interval unit.
//TODO: Bind interval and unit selectors to the state of repeat checkbox?
// -> in that case, no need to submit checkbox, just look for interval/unit values in form data
var UnitSelector = React.createClass({
  render: function() {
    return (
      <select ref="unit" name="unit">
        <option value="days">Day(s)</option>
        <option value="weeks">Week(s)</option>
        <option value="months">Month(s)</option>
        <option value="years">Year(s)</option>
      </select>
      );
  }
});

// Builds selector with values from 1-90
var IntervalSelector = React.createClass({
  render: function() {
    //TODO: There has GOT to be a better way to populate this selector.
    var options = [];
    for (var i=1; i <=90; i++) {
      options.push({val:i});
    }
    options = options.map(function(option){
      return (
        <option key={option.val} value={option.val}>{option.val}</option>
        );
    });
    return (
        <select ref="interval" name="interval">
          {options}
        </select>
      );
  }
});

// Builds category Selector with data from DB.
var CategorySelect = React.createClass({
  getInitialState: function() {
      return {data: []}
  },
  loadCategories: function() {
    // should this url be passed in?
    this.props.url = "http://107.170.57.59:5000/categories{id, name}/:json";
    $.ajax({
      url: this.props.url,
      dataType: 'text',
      success: function(data) {
        data = $.parseJSON(data);
        //update state
        this.setState({data: data['categories']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    //load categories data on mount, should only need to happen once.
    this.loadCategories();
  },
  render: function() {
    var categoryOptions = this.state.data.map(function(category){
      return (
          <option key={category.id} value={category.id}>{category.name}</option>
        );
    });
    return (
      <select ref="category">
        {categoryOptions}
      </select>
      );
  }
});


//Render page
React.render(
  <RuleBox
    ruleUrl="http://107.170.57.59:5000/rules%7Bid,name,amount,category.name%20:as%20category,category.type,start,interval,unit,note%7D/:json"
    apiUrl="http://www.triskeliondevelopment.com/api/"
    pollInterval={30000}
    />,
  document.getElementById('content')
);
