//Creates the title and the subtitle
const titles = {
    title : "Academic Calendar",
    subtitle : "Touro",
};
//populates the title and the subtitles 
document.getElementById("title").textContent = data.title || "";
document.getElementById("subtitle").textContent = data.subtitle || "";


function containsTermDate(date, termDates){
     //This if statement allows for any errors just in case any returns null. Makes sure that the program doesnt crash
  if (!termDates.START || !termDates.END) return false;
  //This creates the start and end date which takes from the JSON data termData and splits the date format from 00/00/00 to [00 , 00 , 00]
  //Allows you to access each month , day and year seperately if needed
  const [startMonth, startDay, startYear] = termDates.START.split('/');
  const [endMonth, endDay, endYear] = termDates.END.split('/');
  //creates a new date object which is a built in JS function adn converts each date from a string into an integer
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay)); // FIXED
  // returns the start and end dates as true if not null
  return date >= startDate && date <= endDate;
}

//creating the calendar grid by refernceing the calendarGrid we have in our HTML which is an empty container that will be used
const calendarGrid = document.getElementById("calendarGrid");
const listElement = document.getElementById('calculations-List');
console.log("Calendar grid element:", calendarGrid); // checks to see if there is an html element to the console, if not then returns null

if (calendarGrid) { // this checks to see if we actuallys called the html element. IF not for this check it will throw an error

  // this creates an array for the days of the week and creates the start date in which we will start the calendar 
  const daysOfWeek = ["U", "M", "T", "W", "R", "F", "S"];
  
  console.log("Starting to fetch calendar.json...");
  

}