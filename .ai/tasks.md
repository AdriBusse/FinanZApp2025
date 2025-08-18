List of tasks you need to implement:

- Now check the create and edit mask for the saving depot. I wanna be able to edit the fields currency and saving goal there. When fetching saving depots always display the currency from this saving depot on all places of this saving depot. That include the listing in the all savingsdepots screen and also in a saving depot itself on all transactions.
- next task is to update the create and edit mask for the expense. Here I wanna be able to edit the new fields of monthlyRecurring with an checkbox and spendingLimit.

- Next I need a new functionality. In the floating button menu of expenses show me a new option to manage expense templates. A click on it will navigate to a new screen. There all expense templates are listed with the functionality to read update delete them. Implement this for me and follow the types from /.ai/newSchema.md. you need to create for sure a new type, a query and an update and create mutation for this.

- Now when expense templates can be used I need to integrate them to the workflow. When create a new expense and the checkbox for recurring expense is selected show me a dropdown with all expense categories listed. I can check now which one I wanna created with the expense. Standard is that all templates are selected. I can unselect them. The mutation of create expense have a key where I can put the id of templates I don’t wanna create. Include them. Best user experience would be that the selection of templates would be persistent in asynchronous storage. So when I unselect some they are still unselected by the next time I create an expense.

- when creating a new expense transaction there is a checkbox unchecked by default which control the autocategorize function. When checked the autocategorize function is used. also here use a persistet storage for the state of this checkbox ofer more transaction creates
