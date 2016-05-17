defmodule Shlack.RoomChannel do
  use Shlack.Web, :channel
  use Amnesia
  use Database
  import Guardian.Phoenix.Socket
  require Logger

  alias Shlack.Talk

  def join("rooms:"<> room_id, payload, socket) do
    if authorized?(socket, room_id) do
      user = current_resource(socket)

      msgs = Amnesia.transaction do
        selection = Message.where talk_id == room_id, select: [content, user_name, timestamp, user_id]
        selection 
          |> Amnesia.Selection.values 
          |> Enum.map(fn[x,y,w,v] -> %{body: x, user: y, at: w, user_id: v} end)
      end

      case Shlack.OnlineUsers.exists?(room_id) do
        :not_found ->
          GenServer.start_link(Shlack.OnlineUsers, [room_id], [])
        _ ->
          :ok
      end

      send(self, %{event: "user:joined", new_user: user.name, messages: msgs})
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(%{event: "user:joined" = event, new_user: user, messages: messages}, socket) do
    "rooms:" <> room_id = socket.topic

    Shlack.OnlineUsers.add_user(room_id, user)

    broadcast! socket, event, %{new_user: user}
    push socket, "im_joined", %{messages: messages}
    Logger.debug "#{user} JOINED TO ROOMS:#{room_id}"
    {:noreply, socket}
  end

  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("new_msg", %{"body" => body, "at" => at}, socket) do
    user = current_resource(socket)
    "rooms:" <> talk_id = socket.topic
    Amnesia.transaction do
      Database.add_message(user.name, user.id, talk_id, body, at)
    end
    broadcast! socket, "new_msg", %{body: body, user: user.name, user_id: user.id, at: at }
    {:noreply, socket}
  end

  def handle_out("new_msg", payload, socket) do
    push socket, "new_msg", payload
    {:noreply, socket}
  end

  def handle_out("user_left", payload, socket) do
    push socket, "user_left", payload
    {:noreply, socket}
  end

  def handle_out(event, payload, socket) do
    push socket, event, payload
    {:noreply, socket}
  end

  def terminate(msg, socket) do
    current_user = current_resource(socket)

    "rooms:" <> room_id = socket.topic

    Shlack.OnlineUsers.del_user(room_id, current_user.name)

    Logger.debug "#{current_user.name} LEAVING #{room_id}"
    broadcast! socket, "user_left", %{user: current_user.name }
    {:shutdown, :left}
  end

  defp authorized?(socket, room_id) do
    Repo.get(Talk, room_id)
  end
end