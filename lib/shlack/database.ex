use Amnesia

defdatabase Database do

	#We define a table, records will be sorted, the first element will be taken as an index
  deftable Message, [:talk_id, :timestamp, :content, :user_name, :user_id ], type: :bag do
		#Nice to have, we declare a struct that represents a record in the database
    @type t :: %Message{timestamp: non_neg_integer, content: String.t, 
    					user_name: String.t, talk_id: integer,
    					user_id: integer}		
  end

  def add_message(user_name, user_id, talk_id, content, timestamp) do
    %Message{talk_id: talk_id, user_name: user_name,
             content: content,
             user_id: user_id, timestamp: timestamp} |> Message.write
  end

  def messages(talk_id) do
    Message.read(talk_id)
  end
end